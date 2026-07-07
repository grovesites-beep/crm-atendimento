import React, { useContext, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from "@material-ui/core";
import { Formik, Form } from "formik";
import AddressForm from "./Forms/AddressForm";
import PaymentForm from "./Forms/PaymentForm";
import ReviewOrder from "./ReviewOrder";
import CheckoutSuccess from "./CheckoutSuccess";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";
import validationSchema from "./FormModel/validationSchema";
import checkoutFormModel from "./FormModel/checkoutFormModel";
import formInitialValues from "./FormModel/formInitialValues";
import useStyles from "./styles";

export default function CheckoutPage(props) {
  const steps = ["Dados", "Personalizar", "Revisar"];
  const { formId, formField } = checkoutFormModel;

  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(1);
  const [datePayment, setDatePayment] = useState(null);
  const [invoiceId] = useState(props.Invoice.id);
  const [paymentText, setPaymentText] = useState("");
  const { user } = useContext(AuthContext);

  const currentValidationSchema = validationSchema[activeStep];
  const isLastStep = activeStep === steps.length - 1;

  function _renderStepContent(step, setFieldValue, setActiveStep, values) {
    switch (step) {
      case 0:
        return (
          <AddressForm
            formField={formField}
            values={values}
            setFieldValue={setFieldValue}
          />
        );
      case 1:
        return (
          <PaymentForm
            formField={formField}
            setFieldValue={setFieldValue}
            setActiveStep={setActiveStep}
            activeStep={step}
            invoiceId={invoiceId}
            values={values}
          />
        );
      case 2:
        return <ReviewOrder />;
      default:
        return <div>Not Found</div>;
    }
  }

  async function _submitForm(values, actions) {
    try {
      const plan = JSON.parse(values.plan);

      const newValues = {
        firstName: values.firstName,
        lastName: values.lastName,
        address2: values.address2,
        city: values.city,
        state: values.state,
        zipcode: values.zipcode,
        country: values.country,
        useAddressForPaymentDetails: values.useAddressForPaymentDetails,
        nameOnCard: values.nameOnCard,
        cardNumber: values.cardNumber,
        cvv: values.cvv,
        plan: values.plan,
        price: plan.price,
        users: plan.users,
        connections: plan.connections,
        invoiceId: invoiceId,
      };

      const { data } = await api.post("/subscription", newValues);
      setDatePayment(data);
      setPaymentText("Ao realizar o pagamento, atualize a página!");
      window.open(data.urlMcPg, "_blank");
      actions.setSubmitting(true);
      toast.success(
        "Assinatura criada com sucesso! Aguardando confirmação do pagamento."
      );
    } catch (err) {
      actions.setSubmitting(false);
      toastError(err);
    }
  }

  function _handleSubmit(values, actions) {
    if (isLastStep) {
      _submitForm(values, actions);
    } else {
      setActiveStep(activeStep + 1);
      actions.setTouched({});
      actions.setSubmitting(false);
    }
  }

  function _handleBack() {
    setActiveStep(activeStep - 1);
  }

  return (
    <React.Fragment>
      <Paper
        elevation={3}
        style={{
          padding: 30,
          borderRadius: 16,
          maxWidth: 900,
          margin: "30px auto",
          background: "#fafafa",
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          align="center"
          style={{
            fontWeight: 700,
            marginBottom: 20,
            letterSpacing: "-.5px",
          }}
        >
          Falta pouquinho para finalizar!
        </Typography>

        <Stepper
          activeStep={activeStep}
          className={classes.stepper}
          style={{
            padding: "20px 0 40px",
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  style: {
                    color:
                      activeStep === steps.indexOf(label)
                        ? "#1976d2"
                        : "#999999",
                  },
                }}
              >
                <Typography style={{ fontWeight: 600 }}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length ? (
          <CheckoutSuccess pix={datePayment} />
        ) : (
          <Formik
            initialValues={{
              ...user,
              ...formInitialValues,
            }}
            validationSchema={currentValidationSchema}
            onSubmit={_handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form id={formId}>
                {_renderStepContent(
                  activeStep,
                  setFieldValue,
                  setActiveStep,
                  values
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 30,
                  }}
                >
                  {activeStep !== 1 && (
                    <Button
                      onClick={_handleBack}
                      className={classes.button}
                      style={{
                        padding: "8px 30px",
                        borderRadius: 10,
                        fontWeight: 600,
                      }}
                    >
                      VOLTAR
                    </Button>
                  )}

                  <div style={{ position: "relative" }}>
                    {activeStep !== 1 && (
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                        style={{
                          padding: "10px 40px",
                          borderRadius: 12,
                          fontWeight: "bold",
                          boxShadow: "0px 3px 12px rgba(25,118,210,.3)",
                        }}
                      >
                        {isLastStep ? "PAGAR" : "PRÓXIMO"}
                      </Button>
                    )}

                    {isSubmitting && (
                      <CircularProgress
                        size={26}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: -13,
                          marginLeft: -13,
                        }}
                      />
                    )}
                  </div>
                </div>

                {paymentText && (
                  <Paper
                    elevation={0}
                    style={{
                      backgroundColor: "#fff3e0",
                      padding: "12px 20px",
                      borderRadius: 12,
                      marginTop: 20,
                      border: "1px solid #ffe0b2",
                    }}
                  >
                    <Typography
                      variant="h6"
                      align="center"
                      style={{
                        color: "#ef6c00",
                        fontWeight: 700,
                      }}
                    >
                      {paymentText}
                    </Typography>
                  </Paper>
                )}
              </Form>
            )}
          </Formik>
        )}
      </Paper>
    </React.Fragment>
  );
}
