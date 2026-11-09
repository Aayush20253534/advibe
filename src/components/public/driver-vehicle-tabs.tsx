"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bike, BusFront, CarFront, Check, Info } from "lucide-react";

type VehicleKey = "bike" | "auto" | "car";

const vehicles = [
  {
    key: "bike" as const,
    name: "Bike",
    icon: Bike,
    image: "/images/blinkmyad/ad-formats/bike-rear.webp",
    alt: "Illustration of a scooter fitted with a rear BlinkMyAd advertising screen",
    description: "A compact screen mounted behind the rider.",
    points: [
      "Two-wheeler in good condition",
      "Screen mounted behind the seat",
      "Earnings depend on assigned campaigns",
    ],
  },
  {
    key: "auto" as const,
    name: "Auto rickshaw",
    icon: BusFront,
    image: "/images/blinkmyad/ad-formats/auto-rear.webp",
    alt: "Illustration of an auto-rickshaw with a rear digital advertising screen",
    description: "A rear or side screen for campaigns on your local routes.",
    points: [
      "Auto in good working condition",
      "Approved rear or side placement",
      "Verification required before assignments",
    ],
  },
  {
    key: "car" as const,
    name: "Car",
    icon: CarFront,
    image: "/images/blinkmyad/ad-formats/car-interior.webp",
    alt: "Illustration of a passenger-facing in-car advertising screen",
    description: "A screen seen by passengers during their journey.",
    points: [
      "Eligible taxi or passenger vehicle",
      "Approved screen placement and installation",
      "Earnings linked to eligible campaigns",
    ],
  },
];

export function DriverVehicleTabs() {
  const [current, setCurrent] = React.useState<VehicleKey>("bike");
  const selected = vehicles.find(vehicle => vehicle.key === current) ?? vehicles[0]!;

  return (
    <div className="bma-driver-vehicle-layout">
      <div className="bma-driver-vehicle-choice">
        <div className="bma-driver-vehicle-tabs" role="group" aria-label="Vehicle type">
          {vehicles.map(({ key, name, icon: Icon }) => (
            <button
              key={key}
              type="button"
              aria-pressed={current === key}
              onClick={() => setCurrent(key)}
              className="bma-driver-vehicle-tab"
            >
              <Icon aria-hidden="true" />
              {name}
            </button>
          ))}
        </div>

        <div className="bma-driver-vehicle-preview" aria-live="polite">
          <div className="bma-driver-vehicle-photo">
            <Image
              key={selected.key}
              src={selected.image}
              alt={selected.alt}
              fill
              sizes="(max-width: 700px) 82vw, (max-width: 1100px) 40vw, 300px"
            />
            <span>Illustration</span>
          </div>
          <div className="bma-driver-vehicle-description">
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <ul>
              {selected.points.map(point => (
                <li key={point}><Check aria-hidden="true" />{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <aside className="bma-driver-earn-card" aria-labelledby="driver-earn-title">
        <h3 id="driver-earn-title">What you can earn</h3>
        <p>Earnings depend on your vehicle, your routes in Prayagraj, the campaigns assigned to your screen, how long the screen is online and your partner agreement.</p>
        <div className="bma-driver-earn-note">
          <Info aria-hidden="true" />
          <span>BlinkMyAd does not publish a guaranteed monthly amount. You see the confirmed rate in your agreement before you sign.</span>
        </div>
        <Link href="/signup?role=driver" className="bma-driver-earn-button">Apply as a driver partner</Link>
      </aside>
    </div>
  );
}
