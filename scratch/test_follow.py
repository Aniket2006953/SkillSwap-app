import requests

BASE_URL = "http://localhost:8000/api/"

def register(username, email, password):
    r = requests.post(BASE_URL + "users/register/", json={"username": username, "email": email, "password": password})
    return r

def login(username, password):
    r = requests.post(BASE_URL + "users/login/", json={"username": username, "password": password})
    return r.json()

def follow(token, username):
    r = requests.post(BASE_URL + f"users/follow/{username}/", headers={"Authorization": f"Bearer {token}"})
    return r

def get_requests(token):
    r = requests.get(BASE_URL + "users/follow-requests/", headers={"Authorization": f"Bearer {token}"})
    return r

try:
    register("user1", "user1@test.com", "password123")
    register("user2", "user2@test.com", "password123")

    token1 = login("user1", "password123").get("access")
    token2 = login("user2", "password123").get("access")

    print("Token1:", token1)
    if not token1 or not token2:
        print("Login failed")
        exit(1)

    res1 = follow(token1, "user2")
    print("Follow Response:", res1.status_code)

    res2 = get_requests(token2)
    print("Get Requests Response:", res2.status_code)
    with open("scratch/err2.html", "w", encoding="utf-8") as f:
        f.write(res2.text)
except Exception as e:
    print(e)
