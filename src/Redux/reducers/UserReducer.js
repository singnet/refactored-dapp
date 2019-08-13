import { userActions } from "../actionCreators";

const InitialUserDetails = {
  login: {
    isLoggedIn: false,
    error: undefined,
    loading: false,
  },
  isInitialized: false,
  isEmailVerified: false,
  walletAddress: undefined,
  email: "",
  username: "",
  emailAlerts: false,
  isTermsAccepted: true,
};

const userReducer = (state = InitialUserDetails, action) => {
  switch (action.type) {
    case userActions.APP_INITIALIZATION_SUCCESS: {
      return { ...state, ...action.payload };
    }
    case userActions.SET_USER_DETAILS: {
      return {
        ...state,
        login: {
          ...state.login,
          ...action.payload.login,
        },
        ...action.payload,
      };
    }
    case userActions.LOGIN_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        login: {
          ...state.login,
          error: undefined,
          loading: false,
          ...action.payload.login,
        },
      };
    }
    case userActions.LOGIN_LOADING: {
      return {
        ...state,
        login: {
          ...state.login,
          error: undefined,
          loading: true,
        },
      };
    }
    case userActions.LOGIN_ERROR: {
      return {
        ...state,
        login: {
          ...state.login,
          loading: false,
          isLoggedIn: false,
          ...action.payload.login,
        },
      };
    }
    case userActions.SIGN_OUT: {
      return {
        ...state,
        login: {
          ...state.login,
          ...action.payload.login,
        },
        walletAddress: undefined,
      };
    }
    case userActions.UPDATE_WALLET_ADDRESS: {
      return { ...state, walletAddress: action.payload };
    }
    case userActions.UPDATE_USERNAME: {
      return { ...state, ...action.payload };
    }
    case userActions.UPDATE_EMAIL_VERIFIED: {
      return { ...state, isEmailVerified: action.payload.isEmailVerified };
    }
    case userActions.UPDATE_EMAIL_ALERTS_SUBSCRIPTION: {
      return { ...state, emailAlerts: action.payload };
    }
    case userActions.UPDATE_IS_TERMS_ACCEPTED: {
      return { ...state, isTermsAccepted: action.payload };
    }
    default: {
      return state;
    }
  }
};

export default userReducer;
