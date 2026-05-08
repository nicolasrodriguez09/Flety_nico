import {
    MapContainer,
    Marker,
    Polygon,
    Polyline,
    Popup,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import { Fragment, useEffect } from 'react';
import L from 'leaflet';
import { colombiaBoundary } from '@/Data/colombiaBoundary';

const defaultCenter = [4.5709, -74.2973];
const colombiaBounds = [
    [-4.5, -82.2],
    [13.8, -66.7],
];

const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const colombiaBoundaryStyle = {
    color: '#16733c',
    dashArray: '8 7',
    fillColor: '#4f9547',
    fillOpacity: 0.08,
    opacity: 0.95,
    weight: 2.4,
};

function isInsideColombiaBounds(lat, lng) {
    const numericLat = Number(lat);
    const numericLng = Number(lng);

    return (
        Number.isFinite(numericLat) &&
        Number.isFinite(numericLng) &&
        numericLat >= colombiaBounds[0][0] &&
        numericLat <= colombiaBounds[1][0] &&
        numericLng >= colombiaBounds[0][1] &&
        numericLng <= colombiaBounds[1][1]
    );
}

function MapClickSelector({ mode, onSelectPoint }) {
    useMapEvents({
        click(event) {
            if (!onSelectPoint) {
                return;
            }

            if (!isInsideColombiaBounds(event.latlng.lat, event.latlng.lng)) {
                return;
            }

            onSelectPoint({
                type: mode,
                lat: Number(event.latlng.lat.toFixed(7)),
                lng: Number(event.latlng.lng.toFixed(7)),
            });
        },
    });

    return null;
}

function hasPoint(lat, lng) {
    return Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
}

function routePositions(route) {
    const geometryPositions = Array.isArray(route.route_geometry)
        ? route.route_geometry
            .map((point) => [Number(point[1]), Number(point[0])])
            .filter(([lat, lng]) => hasPoint(lat, lng))
        : [];

    return geometryPositions;
}

function FitRouteBounds({ routes, originPoint, destinationPoint, draftRoute }) {
    const map = useMap();

    useEffect(() => {
        const points = routes.flatMap((route) => routePositions(route));
        points.push(...routePositions(draftRoute ?? {}));

        if (hasPoint(originPoint?.lat, originPoint?.lng)) {
            points.push([Number(originPoint.lat), Number(originPoint.lng)]);
        }

        if (hasPoint(destinationPoint?.lat, destinationPoint?.lng)) {
            points.push([Number(destinationPoint.lat), Number(destinationPoint.lng)]);
        }

        if (points.length === 0) {
            return;
        }

        if (points.length === 1) {
            map.setView(points[0], 9);

            return;
        }

        map.fitBounds(L.latLngBounds(points), {
            maxZoom: 11,
            padding: [32, 32],
        });
    }, [destinationPoint, draftRoute, map, originPoint, routes]);

    return null;
}

export default function RouteMap({
    routes = [],
    originPoint = null,
    destinationPoint = null,
    selectable = false,
    selectionMode = 'origin',
    onSelectPoint = null,
    draftRoute = null,
    height = '360px',
}) {
    const validRoutes = routes.filter(
        (route) =>
            hasPoint(route.origin_lat, route.origin_lng) &&
            hasPoint(route.destination_lat, route.destination_lng),
    );

    let center = defaultCenter;

    if (hasPoint(originPoint?.lat, originPoint?.lng)) {
        center = [Number(originPoint.lat), Number(originPoint.lng)];
    } else if (validRoutes.length > 0) {
        center = [
            Number(validRoutes[0].origin_lat),
            Number(validRoutes[0].origin_lng),
        ];
    }

    return (
        <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
            <MapContainer
                center={center}
                zoom={6}
                minZoom={5}
                maxBounds={colombiaBounds}
                maxBoundsViscosity={1}
                scrollWheelZoom={true}
                className="z-0"
                style={{ height, width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Polygon
                    positions={colombiaBoundary}
                    pathOptions={colombiaBoundaryStyle}
                    interactive={false}
                />

                {selectable ? (
                    <MapClickSelector
                        mode={selectionMode}
                        onSelectPoint={onSelectPoint}
                    />
                ) : null}

                <FitRouteBounds
                    routes={validRoutes}
                    originPoint={originPoint}
                    destinationPoint={destinationPoint}
                    draftRoute={draftRoute}
                />

                {hasPoint(originPoint?.lat, originPoint?.lng) ? (
                    <Marker
                        position={[Number(originPoint.lat), Number(originPoint.lng)]}
                        icon={markerIcon}
                    >
                        <Popup>Punto de salida seleccionado</Popup>
                    </Marker>
                ) : null}

                {hasPoint(destinationPoint?.lat, destinationPoint?.lng) ? (
                    <Marker
                        position={[
                            Number(destinationPoint.lat),
                            Number(destinationPoint.lng),
                        ]}
                        icon={markerIcon}
                    >
                        <Popup>Punto de llegada seleccionado</Popup>
                    </Marker>
                ) : null}

                {routePositions(draftRoute ?? {}).length >= 2 ? (
                    <Polyline
                        positions={routePositions(draftRoute)}
                        pathOptions={{ color: '#1677ff', weight: 5 }}
                    />
                ) : null}

                {validRoutes.map((route) => {
                    const straightPositions = [
                        [Number(route.origin_lat), Number(route.origin_lng)],
                        [
                            Number(route.destination_lat),
                            Number(route.destination_lng),
                        ],
                    ];

                    const positions = routePositions(route);

                    return (
                        <Fragment key={route.id}>
                            <Marker position={straightPositions[0]} icon={markerIcon}>
                                <Popup>
                                    <strong>Salida:</strong> {route.origin}
                                    <br />
                                    <strong>Destino:</strong>{' '}
                                    {route.destination}
                                    <br />
                                    <strong>Capacidad:</strong>{' '}
                                    {route.available_capacity_kg} kg
                                </Popup>
                            </Marker>

                            <Marker position={straightPositions[1]} icon={markerIcon}>
                                <Popup>
                                    <strong>Llegada:</strong>{' '}
                                    {route.destination}
                                    <br />
                                    <strong>Ruta desde:</strong> {route.origin}
                                </Popup>
                            </Marker>

                            {positions.length >= 2 ? (
                                <Polyline
                                    positions={positions}
                                    pathOptions={{ color: '#1677ff', weight: 5 }}
                                />
                            ) : null}
                        </Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
}
