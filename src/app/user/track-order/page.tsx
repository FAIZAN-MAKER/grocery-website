"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getSocket } from "@/lib/socket";
import {
  MapPin, Navigation, Clock, Loader2, ArrowLeft, Home,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface RouteInfo {
  distanceMeters: number;
  etaMinutes: number;
  polyline: L.LatLngExpression[];
}

const DESTINATION_RADIUS_M = 50;

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 10000,
};

const destinationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/10484/10484697.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -44],
});

const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/103/103512.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

async function fetchRoute(
  start: L.LatLngTuple,
  end: L.LatLngTuple
): Promise<RouteInfo | null> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${start[1]},${start[0]};${end[1]},${end[0]}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM ${res.status}`);

  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route) return null;

  return {
    distanceMeters: Math.round(route.distance),
    etaMinutes: Math.round(route.duration / 60),
    polyline: (route.geometry.coordinates as [number, number][]).map(
      ([lng, lat]) => [lat, lng] as L.LatLngTuple
    ),
  };
}

function MapCenterController({ center }: { center: L.LatLngTuple | null }) {
  const map = useMap();
  const prevCenter = useRef<L.LatLngTuple | null>(null);

  useEffect(() => {
    if (!center) return;
    const [lat, lng] = center;
    const [prevLat, prevLng] = prevCenter.current ?? [null, null];
    if (lat !== prevLat || lng !== prevLng) {
      map.setView(center, map.getZoom(), { animate: true });
      prevCenter.current = center;
    }
  }, [center, map]);

  return null;
}

function MapBoundsController({ driverLoc, destCoords }: {
  driverLoc: L.LatLngTuple | null;
  destCoords: L.LatLngTuple;
}) {
  const map = useMap();
  const hasFitBounds = useRef(false);

  useEffect(() => {
    if (hasFitBounds.current || !driverLoc) return;
    hasFitBounds.current = true;
    const bounds = L.latLngBounds([driverLoc, destCoords]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [driverLoc, destCoords, map]);

  return null;
}

function RoutePolyline({ positions }: { positions: L.LatLngExpression[] }) {
  const map = useMap();

  useEffect(() => {
    if (!positions.length) return;
    const line = L.polyline(positions, {
      color: "#10b981",
      weight: 5,
      opacity: 0.85,
      lineJoin: "round",
    }).addTo(map);
    return () => { map.removeLayer(line); };
  }, [positions, map]);

  return null;
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderData, setOrderData] = useState<{
    destination: { latitude: number; longitude: number; address: string };
    deliveryBoyLocation?: { latitude: number; longitude: number };
  } | null>(null);
  const [driverLocation, setDriverLocation] = useState<L.LatLngTuple | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const socketRef = useRef(getSocket());
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/user/orders/${orderId}`);
        if (!res.ok) throw new Error("Order not found");
        const data = await res.json();
        setOrderData({
          destination: {
            latitude: data.address.latitude,
            longitude: data.address.longitude,
            address: `${data.address.fullAddress}, ${data.address.city}`,
          },
        });
      } catch (err) {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!orderId) return;

    socket.emit("join-room", orderId);
    socket.on("location-updated", (data: { latitude: number; longitude: number }) => {
      setDriverLocation([data.latitude, data.longitude]);
    });

    return () => {
      socket.emit("leave-room", orderId);
      socket.off("location-updated");
    };
  }, [orderId]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setGeoError(null);
      },
      (err) => setGeoError(err.message),
      GEOLOCATION_OPTIONS
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!driverLocation || !orderData?.destination) return;

    const fetchRouteData = async () => {
      try {
        const info = await fetchRoute(
          [driverLocation[0], driverLocation[1]],
          [orderData.destination.latitude, orderData.destination.longitude]
        );
        if (info) setRouteInfo(info);
      } catch (err) {
        console.error("[TrackOrder] Route fetch failed:", err);
      }
    };

    fetchRouteData();
  }, [driverLocation, orderData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-500 font-medium mb-4">{error || "Order not found"}</p>
          <Link
            href="/user/my-orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const destCoords: L.LatLngTuple = [
    orderData.destination.latitude,
    orderData.destination.longitude,
  ];

  const distanceLabel = routeInfo
    ? routeInfo.distanceMeters >= 1000
      ? `${(routeInfo.distanceMeters / 1000).toFixed(1)} km`
      : `${routeInfo.distanceMeters} m`
    : null;

  const etaLabel = routeInfo ? `~${routeInfo.etaMinutes} min` : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/60 to-white pb-20 pt-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          className="flex items-center gap-4 mb-6"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/user/my-orders">
            <button className="flex items-center gap-2 bg-white border border-gray-200 hover:border-green-300 px-4 py-2.5 rounded-2xl text-gray-700 font-medium text-sm transition-colors shadow-sm">
              <ArrowLeft className="w-4 h-4 text-green-600" />
              Back
            </button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Track Order</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                #{orderId?.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <MapContainer
            center={destCoords}
            zoom={15}
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenterController center={driverLocation} />
            <MapBoundsController
              driverLoc={driverLocation}
              destCoords={destCoords}
            />

            <Marker position={destCoords} icon={destinationIcon}>
              <Popup>
                <div className="text-center text-sm">
                  <p className="font-semibold">Delivery Location</p>
                  <p className="text-gray-500 text-xs mt-1">{orderData.destination.address}</p>
                </div>
              </Popup>
            </Marker>

            {driverLocation && (
              <Marker position={driverLocation} icon={driverIcon}>
                <Popup>
                  <div className="text-center text-sm">
                    <p className="font-semibold">Delivery Partner</p>
                    <p className="text-gray-500 text-xs">Live tracking</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {routeInfo && routeInfo.polyline.length > 0 && (
              <RoutePolyline positions={routeInfo.polyline} />
            )}
          </MapContainer>

          <div className="absolute bottom-4 left-4 right-4 z-[1000] pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl">
              {geoError ? (
                <p className="text-xs text-red-500 text-center font-medium">{geoError}</p>
              ) : !driverLocation ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                  <p className="text-sm text-gray-500">Waiting for delivery partner location...</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {distanceLabel ?? "Calculating..."}
                      </p>
                      {etaLabel && (
                        <p className="text-xs text-gray-400">{etaLabel} away</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    Destination
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <Home className="w-5 h-5 text-emerald-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Delivery Address</p>
              <p className="text-xs text-gray-500 mt-1">{orderData.destination.address}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}