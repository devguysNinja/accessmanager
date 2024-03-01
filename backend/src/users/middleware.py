# custom_middleware.py


class CustomMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.
        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"
        print("Access-Control-Allow-Origin", response["Access-Control-Allow-Origin"])
        return response

    def process_response(self, request, response):
        # Set the "Access-Control-Allow-Origin" header
        response["Access-Control-Allow-Origin"] = "http://localhost:3000"  #

        return response
