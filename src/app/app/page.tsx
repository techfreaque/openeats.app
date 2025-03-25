import { Clock, Star } from "lucide-react";
import { useState } from "react";

import { Div } from "@/next-portal/components/ui/div";
import { FlatList } from "@/next-portal/components/ui/flat-list";
import { Image } from "@/next-portal/components/ui/image";
import { SafeAreaView } from "@/next-portal/components/ui/safe-area-view";
import { ScrollView } from "@/next-portal/components/ui/scroll-view";
import { Text } from "@/next-portal/components/ui/text";
import { TouchableOpacity } from "@/next-portal/components/ui/touchable-opacity";

import AddressSelector from "./components/AddressSelector";
import DesktopHeader from "./components/DesktopHeader";

export default function HomeScreen(): JSX.Element {
  const [address, setAddress] = useState("123 Main St, Anytown");
  const router = useRouter();
  const dimensions = useWindowDimensions();
  const isLargeScreen = dimensions.width >= 768;
  const isExtraLargeScreen = dimensions.width >= 1200;
  const { cartItems } = useCart();

  const handleRestaurantPress = (id) => {
    router.push(`/restaurant/${id}`);
  };

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/search",
      params: { category },
    });
  };

  const handleSeeAllPress = (section) => {
    router.push({
      pathname: "/search",
      params: { section },
    });
  };

  const handleAddressChange = (newAddress) => {
    setAddress(newAddress);
  };

  const getCardWidth = () => {
    if (isExtraLargeScreen) {
      return 320;
    }
    if (isLargeScreen) {
      return 280;
    }
    return 240;
  };

  const getGridColumns = () => {
    if (isExtraLargeScreen) {
      return 3;
    }
    if (isLargeScreen) {
      return 2;
    }
    return 1;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Desktop Header for large screens */}
      {isLargeScreen && (
        <DesktopHeader
          currentAddress={address}
          onAddressChange={handleAddressChange}
          cartItemCount={cartItems?.length || 0}
        />
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Location Header - Only show on mobile */}
        {!isLargeScreen && (
          <AddressSelector
            onSelectAddress={handleAddressChange}
            currentAddress={address}
          />
        )}

        <Div
          className={`p-4 ${
            isLargeScreen ? "max-w-7xl mx-auto w-full px-6 pt-6" : ""
          }`}
        >
          {/* Featured Restaurants */}
          <Div className="mb-6">
            <Div className="flex flex-row justify-between items-center mb-4">
              <Text
                className={`font-bold text-gray-800 ${
                  isLargeScreen ? "text-2xl" : "text-lg"
                }`}
              >
                Featured Restaurants
              </Text>
              <TouchableOpacity
                onPress={() => handleSeeAllPress("Featured Restaurants")}
              >
                <Text className="text-sm text-red-500 font-semibold">
                  See All
                </Text>
              </TouchableOpacity>
            </Div>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-ml-2"
            >
              {featuredRestaurants.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  className={`bg-white rounded-xl mr-4 shadow overflow-hidden`}
                  style={{ width: getCardWidth() }}
                  onPress={() => handleRestaurantPress(restaurant.id)}
                >
                  <Image
                    source={{ uri: restaurant.image }}
                    className="w-full h-36 object-cover"
                  />
                  <Div className="p-3">
                    <Text
                      className={`font-bold text-gray-800 mb-1 ${
                        isLargeScreen ? "text-lg" : "text-base"
                      }`}
                    >
                      {restaurant.name}
                    </Text>
                    <Text
                      className={`text-gray-500 mb-2 ${
                        isLargeScreen ? "text-[15px]" : "text-sm"
                      }`}
                    >
                      {restaurant.category}
                    </Text>
                    <Div className="flex flex-row items-center">
                      <Div className="flex flex-row items-center mr-3">
                        <Star
                          size={isLargeScreen ? 16 : 14}
                          color="#FFD700"
                          fill="#FFD700"
                        />
                        <Text
                          className={`ml-1 text-gray-800 ${
                            isLargeScreen ? "text-[15px]" : "text-sm"
                          }`}
                        >
                          {restaurant.rating}
                        </Text>
                      </Div>
                      <Div className="flex flex-row items-center">
                        <Clock size={isLargeScreen ? 16 : 14} color="#6B7280" />
                        <Text
                          className={`ml-1 text-gray-500 ${
                            isLargeScreen ? "text-[15px]" : "text-sm"
                          }`}
                        >
                          {restaurant.deliveryTime}
                        </Text>
                      </Div>
                    </Div>
                  </Div>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Div>

          {/* Categories */}
          <Div className="mb-6">
            <Div className="flex flex-row justify-between items-center mb-4">
              <Text
                className={`font-bold text-gray-800 ${
                  isLargeScreen ? "text-2xl" : "text-lg"
                }`}
              >
                Categories
              </Text>
            </Div>
            <FlatList
              data={categories}
              horizontal={!isLargeScreen}
              numColumns={isLargeScreen ? 5 : 1}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`items-center ${
                    isLargeScreen ? "w-1/5 mr-0 px-3 mb-4" : "mr-6 w-[70px]"
                  }`}
                  onPress={() => handleCategoryPress(item.name)}
                >
                  <Image
                    source={{ uri: item.icon }}
                    className={`${
                      isLargeScreen
                        ? "w-20 h-20 rounded-full"
                        : "w-[60px] h-[60px] rounded-full mb-2"
                    }`}
                  />
                  <Text
                    className={`text-gray-800 text-center ${
                      isLargeScreen ? "text-base mt-2" : "text-sm"
                    }`}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={
                isLargeScreen
                  ? {
                      flexDirection: "row",
                      flexWrap: "wrap",
                      justifyContent: "flex-start",
                    }
                  : undefined
              }
            />
          </Div>

          {/* Popular Restaurants */}
          <Div className="mb-6">
            <Div className="flex flex-row justify-between items-center mb-4">
              <Text
                className={`font-bold text-gray-800 ${
                  isLargeScreen ? "text-2xl" : "text-lg"
                }`}
              >
                Popular Near You
              </Text>
              <TouchableOpacity
                onPress={() => handleSeeAllPress("Popular Restaurants")}
              >
                <Text className="text-sm text-red-500 font-semibold">
                  See All
                </Text>
              </TouchableOpacity>
            </Div>

            {isLargeScreen ? (
              <Div className="flex flex-row flex-wrap justify-between">
                {popularRestaurants.map((restaurant) => (
                  <TouchableOpacity
                    key={restaurant.id}
                    className="flex flex-col w-[48%] mb-4 bg-white rounded-xl shadow overflow-hidden"
                    onPress={() => handleRestaurantPress(restaurant.id)}
                  >
                    <Image
                      source={{ uri: restaurant.image }}
                      className="w-full h-40 object-cover"
                    />
                    <Div className="flex-1 p-3 justify-center">
                      <Text
                        className={`font-bold text-gray-800 mb-1 ${
                          isLargeScreen ? "text-lg" : "text-base"
                        }`}
                      >
                        {restaurant.name}
                      </Text>
                      <Text
                        className={`text-gray-500 mb-2 ${
                          isLargeScreen ? "text-[15px]" : "text-sm"
                        }`}
                      >
                        {restaurant.category}
                      </Text>
                      <Div className="flex flex-row items-center">
                        <Div className="flex flex-row items-center mr-3">
                          <Star
                            size={isLargeScreen ? 16 : 14}
                            color="#FFD700"
                            fill="#FFD700"
                          />
                          <Text
                            className={`ml-1 text-gray-800 ${
                              isLargeScreen ? "text-[15px]" : "text-sm"
                            }`}
                          >
                            {restaurant.rating}
                          </Text>
                        </Div>
                        <Div className="flex flex-row items-center">
                          <Clock
                            size={isLargeScreen ? 16 : 14}
                            color="#6B7280"
                          />
                          <Text
                            className={`ml-1 text-gray-500 ${
                              isLargeScreen ? "text-[15px]" : "text-sm"
                            }`}
                          >
                            {restaurant.deliveryTime}
                          </Text>
                        </Div>
                      </Div>
                    </Div>
                  </TouchableOpacity>
                ))}
              </Div>
            ) : (
              popularRestaurants.map((restaurant) => (
                <TouchableOpacity
                  key={restaurant.id}
                  className="flex flex-row bg-white rounded-xl mb-4 shadow overflow-hidden"
                  onPress={() => handleRestaurantPress(restaurant.id)}
                >
                  <Image
                    source={{ uri: restaurant.image }}
                    className="w-[100px] h-[100px] object-cover"
                  />
                  <Div className="flex-1 p-3 justify-center">
                    <Text className="text-base font-bold text-gray-800 mb-1">
                      {restaurant.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mb-2">
                      {restaurant.category}
                    </Text>
                    <Div className="flex flex-row items-center">
                      <Div className="flex flex-row items-center mr-3">
                        <Star size={14} color="#FFD700" fill="#FFD700" />
                        <Text className="text-sm text-gray-800 ml-1">
                          {restaurant.rating}
                        </Text>
                      </Div>
                      <Div className="flex flex-row items-center">
                        <Clock size={14} color="#6B7280" />
                        <Text className="text-sm text-gray-500 ml-1">
                          {restaurant.deliveryTime}
                        </Text>
                      </Div>
                    </Div>
                  </Div>
                </TouchableOpacity>
              ))
            )}
          </Div>
        </Div>
      </ScrollView>
    </SafeAreaView>
  );
}
