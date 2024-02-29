import jwt, datetime
from mealmanager.settings._base import JWT_SALT
from rest_framework.response import Response

#
# def user_auth(req):
#     token = req.COOKIES.get("jwt", None)
#     if not token or token is None:
#         return {"auth_error": "Unauthenticated!"}
#     try:
#         payload = jwt.decode(token, JWT_SALT, algorithms=["HS256"])
#     except jwt.ExpiredSignatureError:
#         return {"auth_error": "Unauthenticated!"}
#     return payload


def user_auth(req):
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"auth_error": "Token not present!"}
    token = auth_header.split(" ")[1]
    if not token or token is None:
        return {"auth_error": "Token not present!"}
    try:
        payload = jwt.decode(token, JWT_SALT, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return {"auth_error": "Token has expired!"}
    except jwt.InvalidTokenError:
        return {"auth_error": "Token is invalid!"}

    return payload
