import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { CHARACTER_LIMIT } from './comment-input.constants';

const CommentInput = class extends React.Component {
  state = {
    remainingCharactersCount: CHARACTER_LIMIT
  };

  componentWillReceiveProps({ blur }) {
    if (!this.props.blur && blur && this.textInput) {
      this.textInput.blur();
    }
  }
  onChangeText = text => {
    const charactersCount = text.length;
    const remainingNumOfChars = CHARACTER_LIMIT - charactersCount;

    this.setState({
      remainingCharactersCount: remainingNumOfChars
    });

    if (this.props.onChangeText) {
      this.props.onChangeText(text);
    }
  };

  setInput = inputRef => {
    this.textInput = inputRef;
  };

  render() {
    const { placeholder, color, focus, fontSize, value } = this.props;
    let inputStyle = styles.textInput;
    if (focus) {
      this.textInput.focus();
    }
    if (!focus && value) {
      inputStyle = styles.inputText; // SHOW INPUT AS TEXT BOX
    }

    return (
      <View>
        <TextInput
          ref={this.setInput}
          style={inputStyle}
          autoGrow
          maxLength={CHARACTER_LIMIT}
          multiline
          onBlur={this.props.onBlur}
          onFocus={this.props.onFocus}
          onChangeText={this.onChangeText}
          placeholder={placeholder || ''}
          placeholderTextColor="rgba(255, 255, 255, 0.8)"
          selectionColor="#ff3366"
          keyboardAppearance="dark"
          color={color || 'white'}
          fontSize={fontSize || 16}
        />
      </View>
    );
  }
};

CommentInput.propTypes = {
  placeholder: PropTypes.string,
  onChangeText: PropTypes.func,
  onFocus: PropTypes.func
};

const styles = StyleSheet.create({
  characterCount: {
    backgroundColor: 'transparent',
    bottom: 5,
    color: 'white',
    opacity: 0.6,
    fontWeight: 'bold',
    position: 'absolute',
    right: 15,
    textAlign: 'right'
  },
  textInput: {
    width: 250,
    color: 'white',
    fontSize: 22,
    fontWeight: 'normal',
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center'
  },
  inputText: {
    width: 250,
    opacity: 0.6,
    borderRadius: 50,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    color: '#ffffff',
    textAlign: 'center',
    padding: 8
  },
  text: {
    fontSize: 17,
    color: '#ffffff'
  }
});

export default CommentInput;
