import reviewImage from '../images/review-img.jpg';
import mainImage from '../images/main-img.jpg';

export const businessSelected = () => {
  return {
    type: 'BUSINESS_SELECTED',
    payload: {
       businessName: 'ABC',
       rating: 5,
       reviews: reviewImage,
       address: '123 5th Avenue New York, NY 10001',
       telephone: '(212) 555-1234',
       website: 'www.abc.com',
       mainImage: mainImage,
     }
   }
}
