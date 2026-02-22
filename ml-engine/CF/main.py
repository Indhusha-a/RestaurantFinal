from fastapi import FastAPI
from recommender import generate_recommendations

app = FastAPI()

@app.post("/recommend")
def recommend(data: dict):
    user_id = data["userId"]
    ratings = data["ratings"]

    recs = generate_recommendations(user_id, ratings)

    return {"recommendedRestaurantIds": recs}
