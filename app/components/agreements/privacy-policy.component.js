import React from 'react';
import Agreements from './agreements.component';
import { privacyPolicyHtml } from './privacy-policy.constants';

const PrivacyPolicy = (props) => {
    return (
        <Agreements 
            title='Privacy Policy'
            source={privacyPolicyHtml}
        />
    );
};

export default PrivacyPolicy;
