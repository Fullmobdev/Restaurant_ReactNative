import React from 'react';
import Agreements from './agreements.component';
import { termsOfServiceHtml } from './terms-of-service.constants';

const TermsOfService = (props) => {
    return (
        <Agreements 
            title='Terms Of Service'
            source={termsOfServiceHtml}
        />
    );
};

export default TermsOfService;
