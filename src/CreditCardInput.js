import React, { Component } from "react";
import ReactNative, {
  NativeModules,
  View,
  ViewPropTypes,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import PropTypes from 'prop-types';
import CreditCard from "./CardView";
import CCInput from "./CCInput";
import { InjectedProps } from "./connectToState";

const s = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    marginLeft: 20,
  },
  inputLabel: {
    fontWeight: "bold",
  },
  input: {
    height: 40,
  },
});

/* eslint react/prop-types: 0 */ // https://github.com/yannickcr/eslint-plugin-react/issues/106
export default class CreditCardInput extends Component {
  static propTypes = {
    ...InjectedProps,
    labels: PropTypes.object,
    placeholders: PropTypes.object,

    containerStyle: ViewPropTypes.style,
    labelStyle: Text.propTypes.style,
    inputStyle: Text.propTypes.style,
    inputContainerStyle: ViewPropTypes.style,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    cardImageFront: PropTypes.number,
    cardImageBack: PropTypes.number,
    cardScale: PropTypes.number,
    cardFontFamily: PropTypes.string,
    cardBrandIcons: PropTypes.object,

    allowScroll: PropTypes.bool,

    additionalInputsProps: PropTypes.objectOf(PropTypes.shape(TextInput.propTypes)),
  };

  static defaultProps = {
    cardViewSize: {},
    labels: {
      name: "CARDHOLDER'S NAME",
      number: "CARD NUMBER",
      expiry: "EXPIRY",
      cvc: "CVC/CCV",
      postalCode: "POSTAL CODE",
    },
    placeholders: {
      name: "Full Name",
      number: "1234 5678 1234 5678",
      expiry: "MM/YY",
      cvc: "CVC",
      postalCode: "34567",
    },
    inputContainerStyle: {
      borderBottomWidth: 1,
      borderBottomColor: "black",
    },
    validColor: "",
    invalidColor: "red",
    placeholderColor: "gray",
    allowScroll: false,
    additionalInputsProps: {},
  };

  constructor(props) {
    super(props);

    let fullWidth = Dimensions.get("window").width;
    if (this.props.containerStyle && typeof StyleSheet.flatten(this.props.containerStyle).width === 'number') {
      fullWidth = StyleSheet.flatten(this.props.containerStyle).width;
    }

    this.CVC_INPUT_WIDTH = 70;
    this.EXPIRY_INPUT_WIDTH = this.CVC_INPUT_WIDTH;
    this.CARD_NUMBER_INPUT_WIDTH_OFFSET = 40;
    this.CARD_NUMBER_INPUT_WIDTH = fullWidth - this.EXPIRY_INPUT_WIDTH - this.CARD_NUMBER_INPUT_WIDTH_OFFSET;
    this.PREVIOUS_FIELD_OFFSET = 40;
    this.POSTAL_CODE_INPUT_WIDTH = 120;
    this.NAME_INPUT_WIDTH = fullWidth - this.POSTAL_CODE_INPUT_WIDTH - this.CARD_NUMBER_INPUT_WIDTH_OFFSET - this.PREVIOUS_FIELD_OFFSET;
  }

  componentDidMount = () => this._focus(this.props.focused);

  componentWillReceiveProps = newProps => {
    if (this.props.focused !== newProps.focused) this._focus(newProps.focused);
  };

  _focus = field => {
    if (!field) return;

    const scrollResponder = this.refs.Form.getScrollResponder();
    const nodeHandle = ReactNative.findNodeHandle(this.refs[field]);

    NativeModules.UIManager.measureLayoutRelativeToParent(nodeHandle,
      e => { throw e; },
      x => {
        scrollResponder.scrollTo({ x: Math.max(x - this.PREVIOUS_FIELD_OFFSET, 0), animated: true });
        this.refs[field].focus();
      });
  }

  _inputProps = field => {
    const {
      inputStyle, labelStyle, validColor, invalidColor, placeholderColor,
      placeholders, labels, values, status,
      onFocus, onChange, onBecomeEmpty, onBecomeValid,
      additionalInputsProps,
    } = this.props;

    return {
      inputStyle: [s.input, inputStyle],
      labelStyle: [s.inputLabel, labelStyle],
      validColor, invalidColor, placeholderColor,
      ref: field, field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus, onChange, onBecomeEmpty, onBecomeValid,

      additionalInputProps: additionalInputsProps[field],
    };
  };

  render() {
    const {
      cardImageFront, cardImageBack, containerStyle, inputContainerStyle,
      values: { number, expiry, cvc, name, type }, focused,
      allowScroll, requiresName, requiresCVC, requiresPostalCode,
      cardScale, cardFontFamily, cardBrandIcons,
    } = this.props;

    return (
      <View style={[s.container, containerStyle]}>
        <CreditCard focused={focused}
            brand={type}
            scale={cardScale}
            fontFamily={cardFontFamily}
            imageFront={cardImageFront}
            imageBack={cardImageBack}
            customIcons={cardBrandIcons}
            name={requiresName ? name : " "}
            number={number}
            expiry={expiry}
            cvc={cvc} />
        <ScrollView ref="Form"
            horizontal
            keyboardShouldPersistTaps="always"
            scrollEnabled={allowScroll}
            showsHorizontalScrollIndicator={false}
            style={s.form}>
          <CCInput {...this._inputProps("number")}
              containerStyle={[s.inputContainer, inputContainerStyle, { width: this.CARD_NUMBER_INPUT_WIDTH }]} />
          <CCInput {...this._inputProps("expiry")}
              containerStyle={[s.inputContainer, inputContainerStyle, { width: this.EXPIRY_INPUT_WIDTH }]} />
          { requiresCVC &&
            <CCInput {...this._inputProps("cvc")}
                containerStyle={[s.inputContainer, inputContainerStyle, { width: this.CVC_INPUT_WIDTH }]} /> }
          { requiresName &&
            <CCInput {...this._inputProps("name")}
                keyboardType="default"
                containerStyle={[s.inputContainer, inputContainerStyle, { width: this.NAME_INPUT_WIDTH }]} /> }
          { requiresPostalCode &&
            <CCInput {...this._inputProps("postalCode")}
                containerStyle={[s.inputContainer, inputContainerStyle, { width: this.POSTAL_CODE_INPUT_WIDTH }]} /> }
        </ScrollView>
      </View>
    );
  }
}
