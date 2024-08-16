import { fetchLocations, fetchWeatherData } from "@/api";
import { weatherImages } from "@/constants/constant";
import { StatusBar } from "expo-status-bar";
import { debounce } from "lodash";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "react-native-heroicons/outline";

interface WeatherCondition {
  code: number;
  icon: string;
  text: string;
}

interface WeatherCurrent {
  cloud: number;
  condition: WeatherCondition;
  dewpoint_c: number;
  dewpoint_f: number;
  feelslike_c: number;
  feelslike_f: number;
  gust_kph: number;
  gust_mph: number;
  heatindex_c: number;
  heatindex_f: number;
  humidity: number;
  is_day: number;
  last_updated: string;
  last_updated_epoch: number;
  precip_in: number;
  precip_mm: number;
  pressure_in: number;
  pressure_mb: number;
  temp_c: number;
  temp_f: number;
  uv: number;
  vis_km: number;
  vis_miles: number;
  wind_degree: number;
  wind_dir: string;
  wind_kph: number;
  wind_mph: number;
  windchill_c: number;
  windchill_f: number;
}

interface TGeo {
  country: string;
  lat: number;
  localtime: string;
  localtime_epoch: number;
  lon: number;
  name: string;
  region: string;
  tz_id: string;
}

export default function Page() {
  const [showSearch, setShowSearch] = React.useState(false);
  const [locations, setLocations] = React.useState([]);
  const [temp, setTemp] = React.useState<WeatherCurrent | null>();
  const [fore, setFore] = React.useState([]);
  const [geo, setGeo] = React.useState<TGeo | null>();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    handleLocation({ name: "New Delhi" });
  }, []);

  const handleLocation = (loc = { name: "New Delhi" }) => {
    setIsLoading(true);
    setLocations([]);
    setShowSearch(false);
    fetchWeatherData({
      cityName: loc.name,
      days: 7,
    })
      .then((data) => {
        const { current, location, forecast } = data;
        // console.log("forecast : : ", forecast.forecastday);
        setFore(forecast.forecastday);
        setTemp(current);
        setGeo(location);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);

        // You might want to set some error state here
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };

  const handleSearchDebounce = useCallback(debounce(handleSearch, 1200), []);

  return (
    <View className=" flex-1  relative ">
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../../assets/images/bg.png")}
        className="absolute h-full w-full"
      />
      <SafeAreaView className="flex flex-1 pt-16">
        <View style={{ height: "7%" }} className="mx-4 relative z-50">
          <View
            className="flex-row justify-end items-center rounded-full p-1"
            style={{
              backgroundColor: showSearch
                ? "rgba(255,255,255,0.2)"
                : "transparent",
            }}
          >
            {showSearch ? (
              <TextInput
                onChangeText={handleSearchDebounce}
                placeholder="Search city"
                placeholderTextColor={"white"}
                className="pl-6 h-10 flex-1 text-base text-white"
              />
            ) : null}

            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              className="rounded-full bg-white p-3 m-1"
            >
              <MagnifyingGlassIcon size={25} color={"white"} />
            </TouchableOpacity>
          </View>
          {locations.length > 0 && showSearch ? (
            <View className="absolute w-full bg-gray-300 rounded-2xl top-16">
              {locations.map((loc, i) => {
                let showBorder = i + 1 != locations.length;
                let borderClass = showBorder
                  ? "border-b-2 border-b-gray-400"
                  : "";
                return (
                  <TouchableOpacity
                    key={i}
                    className={
                      "flex flex-row items-center border-0 p-3 mb-1 " +
                      borderClass
                    }
                    onPress={() => handleLocation(loc)}
                  >
                    <MapPinIcon color={"black"} />
                    <Text className="text-black text-lg ml-21">
                      {loc?.name as string}, {loc?.country}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        {/* FORECAST WEATHER  */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="white" />
            <Text className="text-white mt-4">Loading weather data...</Text>
          </View>
        ) : (
          <View className="mx-4 flex justify-around flex-1 mb-2">
            {geo && (
              <Text className="text-white text-center text-2xl font-bold">
                {geo?.name},{" "}
                <Text className="text-lg font-semibold text-gray-300">
                  {geo?.country}
                </Text>
              </Text>
            )}

            {temp && (
              <View className="flex-row justify-center">
                <Image
                  source={weatherImages[temp.condition.text]}
                  className="w-52 h-52"
                />
              </View>
            )}

            {temp && (
              <View className="space-y-2">
                <Text className="text-center text-white font-bold text-6xl ml-5">
                  {temp.temp_c}&#176;C
                </Text>
                <Text className="text-center text-white text-xl tracking-widest">
                  {temp.condition.text}
                </Text>
              </View>
            )}
            {temp && (
              <View className="flex-row justify-between mx-4">
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require("../../assets/icons/wind.png")}
                    className="w-6 h-6"
                  />
                  <Text className="text-white font-semibold text-lg ">
                    {"  "}
                    {temp.wind_kph} km/h
                  </Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require("../../assets/icons/drop.png")}
                    className="w-6 h-6"
                  />
                  <Text className="text-white font-semibold text-lg ">
                    {"  "}
                    {temp.precip_mm} mm
                  </Text>
                </View>
                <View className="flex-row space-x-2 items-center">
                  <Image
                    source={require("../../assets/icons/sun.png")}
                    className="w-6 h-6"
                  />
                  {geo && (
                    <Text className="text-white font-semibold text-lg ">
                      {"  "}
                      {temp.feelslike_c}&#176;C
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        <View className="mb-2 space-y-3">
          <View className="flex-row items-center mx-5 space-x-2">
            <CalendarDaysIcon size={22} color={"white"} />
            <Text className="text-white text-lg">{"  "}Daily Forecast</Text>
          </View>
          <ScrollView
            horizontal={true}
            className="flex-row mx-4"
            contentContainerStyle={{ paddingHorizontal: 15 }}
            showsHorizontalScrollIndicator={false}
          >
            {fore.map((fore, i) => (
              <View
                key={i}
                className="flex items-center justify-center rounded-3xl w-24 py-3 space-y-1 mr-4"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <Image
                  source={
                    weatherImages[
                      fore.day.condition.text
                        ? fore.day.condition.text
                        : "Cloudy"
                    ]
                  }
                  className="w-11 h-11"
                />
                <Text className="text-white">
                  {new Date(fore.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </Text>
                <Text className="text-white xl font-semibold">
                  {Math.round(fore.day.avgtemp_c)}&#176;
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
