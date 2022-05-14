/* eslint-disable @typescript-eslint/no-var-requires */
import { useEffect, useState } from 'react';
import { styles } from 'containers/parcel/map/config';
import { doc } from 'firebase/firestore';
import { useFirestore, useFirestoreDocData } from 'reactfire';
import { ParcelType } from 'types/parcel';
import { GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';

const dropOffIcon = require('images/drop-off.svg');
const pickUpIcon = require('images/pick-up.svg');
const driver = require('images/driver.svg');

interface Props {
  parcel: ParcelType;
  isShow: boolean;
}

const ParcelDetailMap: React.FC<Props> = ({ parcel, isShow }) => {
  const showDriver = ['for_pickup', 'picked_up', 'on_going'].includes(
    parcel.status,
  );

  const deliveries = doc(useFirestore(), 'deliveries', parcel.deliveryId);
  const { data } = useFirestoreDocData(deliveries);

  const [directions, setDirections] = useState(undefined);
  const [loading, setLoading] = useState(true);

  // TODO: Remove after API have fixed
  const pickPoint = (parcel.pickUp || parcel.pickup).location;
  const stopPoint = parcel.stops[parcel.stops?.length - 1]?.location;
  const waypoints = parcel.stops
    .filter((_, index) => index < parcel.stops.length - 1)
    .map(item => {
      return {
        location: item.location,
        stopover: true,
      };
    });

  useEffect(() => {
    if (pickPoint) {
      const DirectionsService = new window.google.maps.DirectionsService();
      DirectionsService &&
        DirectionsService.route(
          {
            origin: new window.google.maps.LatLng(
              pickPoint?.lat,
              pickPoint?.lng,
            ),
            destination: new window.google.maps.LatLng(
              stopPoint?.lat,
              stopPoint?.lng,
            ),
            travelMode: window.google.maps.TravelMode.DRIVING,
            waypoints: waypoints,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result);
              setLoading(false);
            } else {
              // eslint-disable-next-line no-console
              console.error(`error fetching directions ${result}`);
            }
          },
        );
    }
  }, [pickPoint]);

  // data.driverLocation = { // Test
  //   current: {
  //     lat: 10.798128258361603,
  //     lng: 106.72302993639153,
  //   },
  // };

  return isShow ? (
    <GoogleMap
      zoom={15}
      center={pickPoint}
      options={{ styles }}
      mapContainerStyle={{ height: 400 }}
    >
      {/* Child components, such as markers, info windows, etc. */}
      <Marker
        position={pickPoint}
        icon={pickUpIcon}
        animation={google.maps.Animation.DROP}
      />
      <Marker
        position={stopPoint}
        icon={dropOffIcon}
        animation={google.maps.Animation.DROP}
      />
      {showDriver && data?.driverLocation?.current && (
        <Marker
          position={data.driverLocation.current}
          icon={driver}
          animation={google.maps.Animation.DROP}
        />
      )}
      {waypoints.map((marker, index) => (
        <Marker position={marker.location} key={index} icon={dropOffIcon} />
      ))}
      {!loading && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#ff4d4f',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            },
          }}
        />
      )}
    </GoogleMap>
  ) : null;
};

export default ParcelDetailMap;
