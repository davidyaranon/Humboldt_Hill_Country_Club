#include <boost/filesystem.hpp>
#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include <bsoncxx/oid.hpp>
#include <mongocxx/client.hpp>
#include <mongocxx/stdx.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <bsoncxx/types.hpp>

#include "load-static-content.hpp"
#include "authentication.hpp"

#include <iostream>
#include <fstream>
#include <vector>
#include <cstdlib>
#include <mutex>
#include <string>
#include <unordered_map>
#include <ctime>
#include <chrono>
#include <unordered_set>

#include <crow.h>
#include <crow/middlewares/cookie_parser.h>

#include <bcrypt/BCrypt.hpp>
#include <jwt-cpp/jwt.h>

using namespace std;
using namespace crow;
using bsoncxx::builder::basic::kvp;
using bsoncxx::builder::basic::make_array;
using bsoncxx::builder::basic::make_document;
using bsoncxx::builder::stream::close_array;
using bsoncxx::builder::stream::close_document;
using bsoncxx::builder::stream::document;
using bsoncxx::builder::stream::finalize;
using bsoncxx::builder::stream::open_array;
using bsoncxx::builder::stream::open_document;
using mongocxx::cursor;

int main(int argc, const char *argv[])
{

  // Main Crow App (utilizing cookie parser)
  crow::App<crow::CookieParser> app;


  // MongoDB Database instance / connection initialization
  char* mongo_db_uri = std::getenv("MONGO_DB_INSTANCE_URI");
  bool database_available = true;
  if(!mongo_db_uri)
  {
    std::cout << "ERROR: MongoDB Instance URI is not found!" << std::endl;
    database_available = false;
  }
  std::string mongo_db_uri_string(mongo_db_uri);
  mongocxx::instance inst{};
  const auto uri = mongocxx::uri{mongo_db_uri_string};
  mongocxx::client client{uri};

  
  // CartDatabase database with Carts collection
  mongocxx::database carts_db = client["CartDatabase"];
  mongocxx::collection cart_collection = carts_db["Carts"];


  // Users database with User collection
  mongocxx::database users_db = client["Users"];
  mongocxx::collection user_collection = users_db["User"];


  // Rate limiter based on IP address and timestamp
  std::unordered_map<std::string, std::pair<int, std::chrono::time_point<std::chrono::steady_clock>>> rate_limit_map;
  

  CROW_ROUTE(app, "/")([](const crow::request &req, crow::response &res)
  {
    sendHTML(res, "index.html"); // Loads initial HTML page
  });

  CROW_ROUTE(app, "/index.html")([](const crow::request &req, crow::response &res)
  {
    sendHTML(res, "index.html"); // Loads initial HTML page
  });

  CROW_ROUTE(app, "/login").methods("GET"_method)([](const crow::request &req, crow::response &res)
  {
    sendHTML(res, "index.html");
  });

  CROW_ROUTE(app, "/register").methods("GET"_method)([](const crow::request &req, crow::response &res)
  {
    sendHTML(res, "index.html");
  });

  CROW_ROUTE(app, "/manifest.json")([](const crow::request &req, crow::response &res)
  {
    sendJSON(res, "manifest.json"); // Loads manifest file
  });

  CROW_ROUTE(app, "/favicon.ico")([](const crow::request &req, crow::response &res)
  {
    sendImage(res, "favicon.ico"); // Loads favicon
  });

  CROW_ROUTE(app, "/asset-manifest.json")([](const crow::request &req, crow::response &res)
  {
    sendJSON(res, "asset-manifest.json"); // Loads asset manifest
  });

  CROW_ROUTE(app, "/static/css/<string>")([](const crow::request &req, crow::response &res, string fileName)
  {
    sendStyle(res, fileName); // Deals with any CSS
  });

  CROW_ROUTE(app, "/static/js/<string>")([](const crow::request &req, crow::response &res, string fileName)
  {
    sendScript(res, fileName); // Loads javascript dependencies
  });

  CROW_ROUTE(app, "/static/media/<string>")([](const crow::request &req, crow::response &res, string fileName)
  {
    sendImage(res, fileName); // Deals with any images we might use
  });

  CROW_ROUTE(app, "/assets/<string>")([](const crow::request &req, crow::response &res, std::string fileName)
  { 
    if(fileName.find(".js") != string::npos)
    {
      sendScript(res, fileName);
    }
    else if (fileName.find(".css") != string::npos)
    {
      sendStyle(res, fileName);
    }
    else if (fileName.find(".png") != string::npos)
    {
      sendImage(res, fileName);
    }
    else if (fileName.find(".svg") != string::npos)
    {
      sendSVG(res, fileName);
    }
    else 
    {
      std::cout << "Unable to serve file: " << fileName << std::endl;
    }
  });

  CROW_ROUTE(app, "/<string>")([](const crow::request &req, crow::response &res, string path)
  {
    std::cout << "Unmatched route: " << path << std::endl;
    res.code = 404;
    res.write("<html><body><h1>404 Not Found</h1></body></html>");
    res.end();
  });

  CROW_ROUTE(app, "/verify-token").methods("POST"_method)([&app](const crow::request &req)
  {

    // Check for secret key on the server environment
    char* secret_key = std::getenv("SECRET_KEY");
    if (!secret_key) 
    {
      std::cerr << "The SECRET_KEY environment variable is not set" << std::endl;
      return crow::response(500);
    }

    // Get token from cookies and verify it using the secret key
    auto& ctx = app.get_context<crow::CookieParser>(req);
    std::string token = ctx.get_cookie("jwtToken");
    std::cout << "Attempting to verify: " << token << std::endl;
    const std::string secret_key_string(secret_key);
    bool isValidToken = verifyToken(token , secret_key_string, "cartapp");
    if(!isValidToken)
    {
      std::cout << "Unable to verify token: " << token << std::endl;
      return crow::response(401);
    }

    // Get the associated email address
    std::string email = extractEmailFromToken(token, secret_key_string, "cartapp");
    if(email.length() <= 0) 
    {
      std::cout << "No email address found" << std::endl;
      return crow::response(401);
    }

    // Get the associated uid
    std::string uid = extractUidFromToken(token, secret_key_string, "cartapp");
    if(uid.length() <= 0)
    {
      std::cout << "No uid found" << std::endl;
      return crow::response(401);
    }

    crow::json::wvalue resJSON;
    resJSON["email"] = email;
    resJSON["uid"] = uid;
    resJSON["verificationSuccess"] = true;

    return crow::response(200, resJSON);
  });

  CROW_ROUTE(app, "/login").methods("POST"_method)([&database_available, &rate_limit_map, &user_collection](const crow::request &req)
  {

    // Ensure MongoDB connection is established
    if(!database_available)
    {
      std::cout << "Database unavailable when trying to login" << std::endl;
      return crow::response(503);
    }

    // Ensure request body is valid
    crow::json::rvalue body = crow::json::load(req.body);
    if(!body)
    {
      std::cout << "Request body is invalid" << std::endl;
      return crow::response(400);
    }

    // Ensures request IP Address is not blacklisted
    std::string ip_address = req.remote_ip_address;
    if (is_rate_limited(rate_limit_map, ip_address)) 
    {
      std::cout << "Too many requests" << std::endl;
      return crow::response(429);
    }

    // Check for secret key on the server environment
    char* secret_key = std::getenv("SECRET_KEY");
    char* secret_key_pepper = std::getenv("SECRET_KEY_PEPPER");
    if (!secret_key || !secret_key_pepper) 
    {
      std::cerr << "The SECRET_KEY environment variable is not set" << std::endl;
      return crow::response(500);
    }

    crow::json::wvalue resJSON;
    std::string returned_token = "";

    // Ensure both email and password request params have been provided
    if(body.has("email") && body.has("password"))
    {
      std::string email = body["email"].s();
      trim(email);
      std::string password = body["password"].s();
      bsoncxx::stdx::optional<bsoncxx::document::value> maybe_result =
        user_collection.find_one(bsoncxx::builder::stream::document{} << "email" << email << bsoncxx::builder::stream::finalize);
  
      // Ensure that a user with the provided email exists in the MongoDB database
      if(maybe_result)
      {
        bsoncxx::document::view result_view = maybe_result->view();
        bsoncxx::document::element password_element = result_view["password"];
        bsoncxx::document::element uid_element = result_view["_id"];

        std::string password_hash = password_element.get_utf8().value.to_string();
        std::string uid = uid_element.get_oid().value.to_string();
        std::string pepper(secret_key_pepper);

        // Ensure provided password matches the email
        if(BCrypt::validatePassword((password + pepper), password_hash))
        {
          std::cout << "User logged in" << std::endl;

          // Create JWT token so user can remain logged in for certain amount of time
          std::string secret_key_string(secret_key);
          auto token = jwt::create()
            .set_issuer("cartapp")
            .set_type("JWS")
            .set_payload_claim("email", jwt::claim(email))
            .set_payload_claim("uid", jwt::claim(uid))
            .set_issued_at(std::chrono::system_clock::now())
            .set_expires_at(std::chrono::system_clock::now() + std::chrono::seconds{60*60*24*7})
            .sign(jwt::algorithm::hs256{secret_key_string});

          returned_token = token;
          resJSON["resString"] = "Logged in";
          resJSON["loginSuccess"] = true;
        }
        else
        {
          std::cout << "Incorrect password" << std::endl;
          resJSON["loginSuccess"] = false;
          resJSON["resString"] = "Incorrect password";
        }
      }
      else
      {
        std::cout << "User does not exist" << std::endl;
        resJSON["loginSuccess"] = false;
        resJSON["resString"] = "Email not found";
      }
    }
    else
    {
      std::cout << "Missing request params" << std::endl;
      resJSON["loginSuccess"] = false;
      resJSON["resString"] = "Unable to log into account, make sure all info is filled in";
    }

    // return JSON response along with the JWT token as a cookie
    crow::response res = crow::response(200, resJSON);
    std::string cookie_settings = "; HttpOnly; Secure; SameSite=Strict";
    std::string cookie_settings_temp = "; HttpOnly; SameSite=Strict";
    res.set_header("Set-Cookie", "jwtToken=" + returned_token + cookie_settings_temp);
    return res;
  });

  CROW_ROUTE(app, "/register").methods("POST"_method)([&database_available, &rate_limit_map, &user_collection](const crow::request &req)
  {

    // Ensure MongoDB connection is established
    if(!database_available)
    {
      std::cout << "Database unavailable when trying to register account" << std::endl;
      return crow::response(503);
    }

    // Ensure request body is valid
    crow::json::rvalue body = crow::json::load(req.body);
    if(!body)
    {
      std::cout << "Invalid request body" << std::endl;
      return crow::response(400);
    }

    // Ensures request IP Address is not blacklisted
    std::string ip_address = req.remote_ip_address;
    if (is_rate_limited(rate_limit_map, ip_address)) 
    {
      std::cout << "Too many requests" << std::endl;
      return crow::response(429);
    }

    // Ensure secret key is valid and available on server
    char* secret_key = std::getenv("SECRET_KEY");
    char* secret_key_pepper = std::getenv("SECRET_KEY_PEPPER");
    if(!secret_key || !secret_key_pepper)
    {
      std::cerr << "The SECRET_KEY environment variable is not set" << std::endl;
      return crow::response(500);
    }

    crow::json::wvalue resJSON;
    std::string returned_token = "";

    // Ensure both email and password params are valid and/or were provided by user
    if(body.has("email") && body.has("password"))
    {
      std::string email = body["email"].s();
      std::string password = body["password"].s();
      std::string secret_key_string(secret_key);

      // Ensure user with email does not already exist
      bsoncxx::stdx::optional<bsoncxx::document::value> maybe_result = 
        user_collection.find_one(bsoncxx::builder::stream::document{} << "email" << email << bsoncxx::builder::stream::finalize);
      if(maybe_result)
      {
        std::cout << "user already exists!" << std::endl;
        resJSON["resString"] = "An account already exists with this email!";
        resJSON["registerSuccess"] = false;
      }
      else 
      {
        // Create row in User collection wil email and hashed password
        std::string pepper(secret_key_pepper);
        std::string hashed_password = BCrypt::generateHash((password + pepper));
        bsoncxx::document::value doc_value = make_document(kvp("email", email), kvp("password", hashed_password));
        auto insert_result = user_collection.insert_one(std::move(doc_value));

        std::string uid = insert_result->inserted_id().get_oid().value.to_string();

        // Create token so user can remain logged in for a certain amount of time
        auto token = jwt::create()
          .set_issuer("cartapp")
          .set_type("JWS")
          .set_payload_claim("email", jwt::claim(email))
          .set_payload_claim("uid", jwt::claim(uid))
          .set_issued_at(std::chrono::system_clock::now())
          .set_expires_at(std::chrono::system_clock::now() + std::chrono::seconds{60*60*24*7})
          .sign(jwt::algorithm::hs256{secret_key_string});

        returned_token = token;
        resJSON["registerSuccess"] = true;
        resJSON["resString"] = "Registered successfully";
      }
    }
    else 
    {
      std::cout << "Missing request params: email and/or password not provided" << std::endl;
      resJSON["resString"] = "Unable to register, make sure both email and password are provided";
      resJSON["registerSuccess"] = false;
    }

    // return JSON response along with the JWT token as a cookie
    crow::response res = crow::response(200, resJSON);
    std::string cookie_settings = "; HttpOnly; Secure; SameSite=Strict";
    std::string cookie_settings_temp = "; HttpOnly; SameSite=Strict";
    res.set_header("Set-Cookie", "jwtToken=" + returned_token + cookie_settings_temp);
    return res;
  });

  CROW_ROUTE(app, "/logout").methods("POST"_method)([](const crow::request &req)
  {
    crow::response res = crow::response(200);
    std::string cookie_settings = "jwtToken=; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    std::string cookie_settings_temp = "jwtToken=; HttpOnly; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    res.set_header("Set-Cookie", cookie_settings_temp);
    return res;
  });

  CROW_ROUTE(app, "/checkout").methods("POST"_method)([&](const crow::request& req)
  {

    // Ensure MongoDB connection is established
    if(!database_available)
    {
      std::cout << "Database unavailable when trying to register account" << std::endl;
      return crow::response(503);
    }

    // Ensure request body is valid
    crow::json::rvalue body = crow::json::load(req.body);
    if(!body)
    {
      std::cout << "Invalid request body" << std::endl;
      return crow::response(400);
    }

    crow::json::wvalue resJSON;

    resJSON["resString"] = "Successfully checked out a cart";

    resJSON["databaseAvailable"] = database_available;

    return crow::response(resJSON);
  });


  // Necessary Crow stuff to run server
  char *port = getenv("PORT");
  uint16_t iPort = static_cast<uint16_t>(port != NULL ? std::stoi(port) : 18080);
  app.port(iPort).multithreaded().run();

  return 0;
}

// docker run -v /Users/admin/Documents/Cart_Checkout/cart_checkout:/usr/src/cart_checkout -p 8080:8080 -e PORT=8080 cart_box:latest /usr/src/cart_checkout/build/cart_checkout
