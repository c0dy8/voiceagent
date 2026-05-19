import requests
from langchain.tools import tool


@tool
def recipe_search(query: str) -> str:
    """Search for recipes by name or main ingredient using TheMealDB API.

    Args:
        query: The recipe name or main ingredient to search for.

    Returns:
        A formatted string with recipe name, ingredients and cooking steps.
    """
    url = f"https://www.themealdb.com/api/json/v1/1/search.php?s={query}"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
    except Exception as e:
        return f"Error fetching recipe: {str(e)}"

    if not data.get("meals"):
        return f"No recipes found for '{query}'. Try a different ingredient or dish name."

    meal = data["meals"][0]
    name = meal["strMeal"]
    category = meal.get("strCategory", "Unknown")
    area = meal.get("strArea", "Unknown")
    instructions = meal.get("strInstructions", "No instructions available.")

    ingredients = []
    for i in range(1, 21):
        ingredient = meal.get(f"strIngredient{i}", "").strip()
        measure = meal.get(f"strMeasure{i}", "").strip()
        if ingredient:
            ingredients.append(f"- {measure} {ingredient}".strip())

    result = (
        f"**{name}** ({category} · {area})\n\n"
        f"**Ingredients:**\n" + "\n".join(ingredients) +
        f"\n\n**Instructions:**\n{instructions[:800]}..."
        if len(instructions) > 800 else
        f"**{name}** ({category} · {area})\n\n"
        f"**Ingredients:**\n" + "\n".join(ingredients) +
        f"\n\n**Instructions:**\n{instructions}"
    )
    return result


@tool
def nutritional_info(ingredient: str) -> str:
    """Get nutritional information for a food item or ingredient using USDA FoodData Central API.

    Args:
        ingredient: The food item or ingredient name to look up.

    Returns:
        A formatted string with calories, protein, carbohydrates and fat per 100g.
    """
    url = (
        f"https://api.nal.usda.gov/fdc/v1/foods/search"
        f"?query={ingredient}&api_key=DEMO_KEY&pageSize=5"
    )
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
    except Exception as e:
        return f"Error fetching nutritional info: {str(e)}"

    foods = data.get("foods", [])
    if not foods:
        return f"No nutritional data found for '{ingredient}'."

    food = foods[0]
    name = food.get("description", ingredient)
    nutrients = {n["nutrientName"]: n["value"] for n in food.get("foodNutrients", [])}

    calories = nutrients.get("Energy", "N/A")
    protein = nutrients.get("Protein", "N/A")
    fat = nutrients.get("Total lipid (fat)", "N/A")
    carbs = nutrients.get("Carbohydrate, by difference", "N/A")
    fiber = nutrients.get("Fiber, total dietary", "N/A")

    return (
        f"**Nutritional info for {name}** (per 100g):\n"
        f"- Calories: {calories} kcal\n"
        f"- Protein: {protein}g\n"
        f"- Carbohydrates: {carbs}g\n"
        f"- Fat: {fat}g\n"
        f"- Fiber: {fiber}g"
    )
