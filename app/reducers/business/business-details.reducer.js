export const INITIAL_STATE = {
    apiId: '',
    businessId: '',
    businessName: '',
    category: '',
    createdDate: '',
    rating: 0,
    reviews: '',
    telephone: '',
    address: '',
    website: '',
    mainImage: '',
    location: {},
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case 'BUSINESS_SELECTED':
      return {
        ...state,
        businessName: action.payload.businessName,
        rating: action.payload.rating,
        reviews: action.payload.reviews,
        telephone: action.payload.telephone,
        address: action.payload.address,
        website: action.payload.website,
        mainImage: action.payload.mainImage,
        location: action.payload.location,
      };

    default:
      return state;
  }
};
