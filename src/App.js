import React, { useState, useEffect } from 'react'
import './App.css';
import ReactMapGL, { Marker, Popup, Source, Layer } from 'react-map-gl'
import { length as turfLength, along as turfAlong } from '@turf/turf'
import * as parkDate from "./data/skateboard-parks.json";

function App() {
	const [viewport, setViewport] = useState({
		latitude: 45.4211,
		longitude: -75.6903,
		width: '100vw',
		height: '100vh',
		zoom: 10
	})

	const [selectedPark, setSelectedPark] = useState(null);

	const first = parkDate.features[0].geometry.coordinates;
	let points = parkDate.features.map(park => park.geometry.coordinates);
	points.push(first);
	points = [[-75.625996131485707, 45.375401587496128], [-75.857009812435976, 45.290758029776626], [-76.206087708136721, 45.470459866077654]]




	const route = {
		"type": "FeatureCollection",
		"features": [
			{
				"type": "Feature",
				"properties": {
					"stroke": "#f06292",
					"stroke-width": 3,
					"stroke-opacity": 1,
					"line-join": "round",
					"line-cap": "round"
				},
				"geometry": {
					"type": "LineString",
					"coordinates": points

				}
			}
		]
	}
	// Calculate the distance in kilometers between route start/end point.
	let lineDistance = turfLength(route.features[0]);

	let arc = [];

	// Number of steps to use in the arc and animation, more steps means
	// a smoother arc and animation, but too many steps will result in a
	// low frame rate
	let steps = 500;
	// Draw an arc between the `origin` & `destination` of the two points
	for (let i = 0; i < lineDistance; i += lineDistance / steps) {
		let segment = turfAlong(route.features[0], i);
		arc.push(segment.geometry.coordinates);
	}
	console.log({ points });
	console.log({ arc });
	// Update the route with calculated arc coordinates
	// route.features[0].geometry.coordinates = arc;
	let route2 = {
		"type": "FeatureCollection",
		"features": [
			{
				"type": "Feature",
				"properties": {
					"stroke": "#f06292",
					"stroke-width": 3,
					"stroke-opacity": 1,
					"line-join": "round",
					"line-cap": "round"
				},
				"geometry": {
					"type": "LineString",
					"coordinates": arc

				}
			}
		]
	}
	useEffect(() => {
		const listener = e => {
			if (e.key === "Escape") {
				setSelectedPark(null);
			}
		};
		window.addEventListener("keydown", listener);

		return () => {
			window.removeEventListener("keydown", listener);
		};
	}, []);

	return (
		<div>
			<ReactMapGL
				{...viewport}
				mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
				onViewportChange={viewport => {
					setViewport(viewport);
				}}
				mapStyle='mapbox://styles/maxsk8er/ckqldso6mlbim17p8462adx9y'
			>
				<Source id='polylineLayer' type='geojson' data={route2}>
					<Layer
						id='route'
						type='line'
						source='route'
						layout={{
							'line-join': 'round',
							'line-cap': 'round',
						}}
						paint={{
							'line-color': '#333',
							'line-width': 2,
						}}
					/>
				</Source>
				{parkDate.features.map(park => (
					<Marker
						key={park.properties.PARK_ID}
						latitude={park.geometry.coordinates[1]}
						longitude={park.geometry.coordinates[0]}
					>
						<button
							className="marker-btn"
							onClick={e => {
								e.preventDefault();
								setSelectedPark(park);
							}}
						>
							X
						</button>
					</Marker>
				))}
				{selectedPark ? (
					<Popup
						latitude={selectedPark.geometry.coordinates[1]}
						longitude={selectedPark.geometry.coordinates[0]}
						onClose={() => {
							setSelectedPark(null);
						}}
					>
						<div>
							<h2>{selectedPark.properties.NAME}</h2>
							<p>{selectedPark.properties.DESCRIPTIO}</p>
						</div>
					</Popup>
				) : null}
			</ReactMapGL>
		</div>
	);
}

export default App;
