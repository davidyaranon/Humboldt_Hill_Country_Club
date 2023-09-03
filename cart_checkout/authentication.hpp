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

#include <bcrypt/BCrypt.hpp>
#include <jwt-cpp/jwt.h>

/**
 * @brief Verifies that the JWT token sent through the POST request is valid and
 * has not expired/been tampered with.
 *
 * @param token the JWT token to verify
 * @param secret_key_string the secret key environment variable used for verification
 *
 * @return true if the JWT token is valid.
 * @return false if the JWT token is not valid.
 */
bool verifyToken(const std::string &token, const std::string &secret_key_string, const std::string &issuer)
{
  try
  {
    auto decoded_token = jwt::decode(token);
    auto verifier = jwt::verify()
      .allow_algorithm(jwt::algorithm::hs256{secret_key_string})
      .with_issuer(issuer);

    verifier.verify(decoded_token);

    return true;
  }
  catch (const std::exception &e)
  {
    std::cerr << "Token verification error: " << e.what() << std::endl;
    return false;
  }

  return false;
}

/**
 * @brief Returns the email associated with the provided JWT token.
 *
 * @param token the JWT token.
 * @param secret_key_string the secret key string used for verification.
 *
 * @return std::string the associated email address if it exists, otherwise an empty string.
 */
std::string extractEmailFromToken(const std::string &token, const std::string &secret_key_string, const std::string &issuer)
{
  try
  {
    auto decoded_token = jwt::decode(token);
    auto verifier = jwt::verify().allow_algorithm(jwt::algorithm::hs256{secret_key_string}).with_issuer(issuer);

    verifier.verify(decoded_token);
    auto email_claim = decoded_token.get_payload_claim("email");

    return email_claim.as_string();
  }
  catch (const std::exception &e)
  {
    std::cerr << "Token decoding/verification error: " << e.what() << std::endl;
    return "";
  }
}

/**
 * @brief Returns the uid associated with the provided JWT token.
 * This value is just the _id_ associated with the MongoDB document.
 *
 * @param token the JWT token.
 * @param secret_key_string the secret key string used for verification.
 *
 * @return std::string the associated uid if it exists, otherwise an empty string.
 */
std::string extractUidFromToken(const std::string &token, const std::string &secret_key_string, const std::string &issuer)
{
  try
  {
    auto decoded_token = jwt::decode(token);
    auto verifier = jwt::verify().allow_algorithm(jwt::algorithm::hs256{secret_key_string}).with_issuer(issuer);

    verifier.verify(decoded_token);
    auto uid_claim = decoded_token.get_payload_claim("uid");

    return uid_claim.as_string();
  }
  catch (const std::exception &e)
  {
    std::cerr << "Token decoding/verification error: " << e.what() << std::endl;
    return "";
  }
}

/**
 * @brief Determines whether the IP Address accessing endpoints has not sent too many requests
 *
 * @param ip_address the string representing the user's IP address
 * @return true if the user has sent too many requests
 * @return false if the user is good to continue
 */
bool is_rate_limited(std::unordered_map<std::string, std::pair<int, std::chrono::time_point<std::chrono::steady_clock>>> &rate_limit_map, const std::string &ip_address)
{
  auto current_time = std::chrono::steady_clock::now();
  if (rate_limit_map.find(ip_address) != rate_limit_map.end())
  {
    auto &pair = rate_limit_map[ip_address];
    auto request_count = pair.first;
    auto last_request_time = pair.second;

    if (current_time - last_request_time < std::chrono::seconds(60) && request_count >= 5)
    {
      return true;
    }
    else if (current_time - last_request_time >= std::chrono::seconds(60))
    {
      rate_limit_map[ip_address] = {1, current_time};
    }
    else
    {
      pair.first++;
    }
  }
  else
  {
    rate_limit_map[ip_address] = {1, current_time};
  }
  return false;
}