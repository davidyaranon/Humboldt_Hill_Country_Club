cmake_minimum_required(VERSION 3.14)

project(cart_checkout)

set(CMAKE_CXX_STANDARD 11)
set(THREADS_PREFER_PTHREAD_FLAG ON)

find_package(mongocxx REQUIRED)
find_package(bsoncxx REQUIRED)
find_package(OpenSSL REQUIRED)

include_directories(${LIBMONGOCXX_INCLUDE_DIRS})
include_directories(${LIBBSONCXX_INCLUDE_DIRS})
include_directories("/usr/local/lib")
include_directories("/usr/local/include")
include_directories("/usr/include")
include_directories("/usr/include/boost")
include_directories("/usr/src/cart_checkout/asio")
include_directories("/usr/src/cart_checkout/crow")

find_package(Boost COMPONENTS system filesystem REQUIRED)
find_package(Threads REQUIRED)

add_executable(cart_checkout main.cpp)
target_include_directories(cart_checkout PRIVATE ${Boost_INCLUDE_DIRS})
target_link_libraries(cart_checkout 
  PRIVATE 
    ${Boost_LIBRARIES} 
    Threads::Threads 
    mongo::bsoncxx_shared
    mongo::mongocxx_shared
    /usr/local/lib/libbcrypt.a 
    OpenSSL::Crypto
)
