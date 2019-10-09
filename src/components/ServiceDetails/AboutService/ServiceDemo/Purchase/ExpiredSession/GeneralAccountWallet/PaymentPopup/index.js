import React, { Component } from "react";
import { withStyles } from "@material-ui/styles";
import Modal from "@material-ui/core/Modal";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CloseIcon from "@material-ui/icons/Close";
import IconButton from "@material-ui/core/IconButton";
import CardContent from "@material-ui/core/CardContent";
import { connect } from "react-redux";
import isEmpty from "lodash/isEmpty";
import { withRouter } from "react-router-dom";

import Details from "./Details";
import Purchase from "./Purchase";
import PrivateKey from "./PrivateKey";
import Summary from "./Summary";
import PopupDetails from "../PopupDetails";
import { useStyles } from "./styles";
import { paymentActions } from "../../../../../../../../Redux/actionCreators";
import { groupInfo } from "../../../../../../../../Redux/reducers/ServiceDetailsReducer";

class CreateWalletPopup extends Component {
  state = {
    progressText: ["Details", "Purchase", "Private Key", "Summary"],
    activeSection: 1,
    privateKey: undefined,
    amount: "",
    item: "",
    quantity: "",
  };

  componentDidMount = () => {
    if (!isEmpty(this.props.paypalInProgress)) {
      this.purchaseWallet();
    }
  };

  purchaseWallet = () => {
    this.setState({ activeSection: 2 });
    this.props.setVisibility(true);
  };

  handleClose = () => {
    this.props.setVisibility(false);
  };

  handleNextSection = () => {
    this.setState({ activeSection: this.state.activeSection + 1 });
  };

  handleInitiatePayment = (payType, amount, currency, item, quantity) => {
    const {
      match: {
        params: { orgId, serviceId },
      },
      group: {
        group_id,
        payment: { payment_address },
      },
      initiatePayment,
      orderType,
    } = this.props;
    const paymentObj = {
      price: { amount: Number(amount), currency },
      item_details: {
        item,
        quantity: Number(quantity),
        org_id: orgId,
        service_id: serviceId,
        group_id,
        receipient: payment_address,
        order_type: orderType,
      },
      payment_method: payType,
    };

    initiatePayment(paymentObj);
  };

  handleExecutePayment = () => {
    const {
      paypalInProgress: { orderId, paymentId, paypalPaymentId, PayerID },
      executePayment,
    } = this.props;
    const paymentExecObj = {
      order_id: orderId,
      payment_id: paymentId,
      payment_details: {
        payer_id: PayerID,
        payment_id: paypalPaymentId,
      },
    };
    return executePayment(paymentExecObj).then(response => {
      const {
        private_key: privateKey,
        item_details: { item, quantity },
        price: { amount },
      } = response.data;
      this.setState({ privateKey, amount, quantity, item });
      this.handleNextSection();
    });
  };

  render() {
    const { classes, visible, paypalInProgress, topup } = this.props;
    const { activeSection, privateKey, amount, item, quantity } = this.state;

    const progressText = ["Details", "Purchase", "Summary"];
    const PopupProgressBarComponents = [
      {
        key: 1,
        component: <Details handleNextSection={this.handleNextSection} initiatePayment={this.handleInitiatePayment} />,
      },
      {
        key: 2,
        component: <Purchase paypalInProgress={paypalInProgress} executePayment={this.handleExecutePayment} />,
      },
      { key: 4, component: <Summary amount={amount} item={item} quantity={quantity} handleClose={this.handleClose} /> },
    ];

    if (!topup) {
      progressText.splice(2, 0, "Private Key");
      PopupProgressBarComponents.splice(2, 0, {
        key: 3,
        component: <PrivateKey privateKey={privateKey} handleNextSection={this.handleNextSection} />,
      });
    }

    return (
      <div className={classes.generalAccWalletContainer}>
        <Modal open={visible} onClose={this.handleClose} className={classes.Modal}>
          <Card className={classes.card}>
            <CardHeader
              className={classes.CardHeader}
              title="Create General Account Wallet"
              action={
                <IconButton onClick={this.handleClose}>
                  <CloseIcon />
                </IconButton>
              }
            />
            <CardContent className={classes.CardContent}>
              {PopupProgressBarComponents.map((item, index) => (
                <PopupDetails
                  item={item}
                  key={item.key}
                  active={activeSection === index + 1}
                  activeSection={activeSection}
                  progressText={progressText}
                />
              ))}
            </CardContent>
          </Card>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  paypalInProgress: state.paymentReducer.paypalInProgress,
  group: groupInfo(state),
});

const mapDispatchToProps = dispatch => ({
  initiatePayment: paymentObj => dispatch(paymentActions.initiatePayment(paymentObj)),
  executePayment: paymentExecObj => dispatch(paymentActions.executePayment(paymentExecObj)),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(useStyles)(CreateWalletPopup))
);