export const AddressComponentTypes = {
    neighborhood: 'neighborhood',
    sublocality: 'sublocality_level_1',
    locality: 'locality',
    route: 'route',
    country: 'country'
};

export const getScoreFromAddressComponentTypes = (types) => {
    if (types.indexOf(AddressComponentTypes.neighborhood) > -1) {
        return 4;
    } else if (types.indexOf(AddressComponentTypes.sublocality) > -1) {
        return 3;
    } else if (types.indexOf(AddressComponentTypes.locality) > -1) {
        return 2;
    } else if (types.indexOf(AddressComponentTypes.route) > -1) {
        return 1;
    }

    return 0;
};
