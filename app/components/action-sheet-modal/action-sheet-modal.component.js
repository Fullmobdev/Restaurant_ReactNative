import React, { PropTypes } from 'react';
import { KeyboardAvoidingView, Modal, Text, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';

const ActionSheetModal = ({
    onCloseModal,
    visible,
    children
}) => {
    return (
        <Modal
            animationType='slide'
            visible={visible} 
            transparent={true}
        >
            <KeyboardAvoidingView 
                behavior="padding" 
                style={styles.actionSheetModalContainer}
            >
                <TouchableWithoutFeedback onPress={onCloseModal}>
                    <View style={styles.touchableContainer}></View>
                </TouchableWithoutFeedback>
                <View style={styles.actionSheetModalContent}>
                    {children}
                </View>        
            </KeyboardAvoidingView>
        </Modal>
    )
}

ActionSheetModal.propTypes = {
    onCloseModal: PropTypes.func,
    visible: PropTypes.bool.isRequired
}


const styles = StyleSheet.create({
    actionSheetModalContainer: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    actionSheetModalContent: {
        backgroundColor: 'white',
        display: 'flex'
    },
    touchableContainer: {
        flex: 1
    }
});
export default ActionSheetModal;