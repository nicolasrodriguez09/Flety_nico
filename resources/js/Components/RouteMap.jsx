import {
    MapContainer,
    Marker,
    Polyline,
    Popup,
    TileLayer,
    useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';

const defaultCenter = [4.5709, -74.2973];

const markerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function MapClickSelector({ mode, onSelectPoint }) {
    useMapEvents({
        click(event) {
            if (!onSelectPoint) {
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

export default function RouteMap({
    routes = [],
    originPoint = null,
    destinationPoint = null,
    selectable = false,
    selectionMode = 'origin',
    onSelectPoint = null,
    height = '360px',
}) {
    const validRoutes = routes.filter(
        (route) =>
            route.origin_lat &&
            route.origin_lng &&
            route.destination_lat &&
            route.destination_lng,
    );

    let center = defaultCenter;

    if (originPoint?.lat && originPoint?.lng) {
        center = [originPoint.lat, originPoint.lng];
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
                scrollWheelZoom={true}
                className="z-0"
                style={{ height, width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {selectable ? (
                    <MapClickSelector
                        mode={selectionMode}
                        onSelectPoint={onSelectPoint}
                    />
                ) : null}

                {originPoint?.lat && originPoint?.lng ? (
                    <Marker
                        position={[originPoint.lat, originPoint.lng]}
                        icon={markerIcon}
                    >
                        <Popup>Punto de salida seleccionado</Popup>
                    </Marker>
                ) : null}

                {destinationPoint?.lat && destinationPoint?.lng ? (
                    <Marker
                        position={[destinationPoint.lat, destinationPoint.lng]}
                        icon={markerIcon}
                    >
                        <Popup>Punto de llegada seleccionado</Popup>
                    </Marker>
                ) : null}

                {originPoint?.lat &&
                originPoint?.lng &&
                destinationPoint?.lat &&
                destinationPoint?.lng ? (
                    <Polyline
                        positions={[
                            [originPoint.lat, originPoint.lng],
                            [destinationPoint.lat, destinationPoint.lng],
                        ]}
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

                    const routeGeometryPositions = Array.isArray(route.route_geometry)
                        ? route.route_geometry.map((point) => [
                            Number(point[1]),
                            Number(point[0]),
                        ])
                        : [];

                    const positions = routeGeometryPositions.length
                        ? routeGeometryPositions
                        : straightPositions;

                    return (
                        <div key={route.id}>
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

                            <Polyline positions={positions} />
                        </div>
                    );
                })}
            </MapContainer>
        </div>
    );
}