import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { toast } from "react-toastify";

// ==================== CONSTANTS ====================
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const REMEMBER_ME_KEY = "rememberMe";

// ==================== INITIAL STATE ====================
const getInitialState = () => {
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
  const storage = rememberMe ? localStorage : sessionStorage;

  return {
    user: JSON.parse(storage.getItem(USER_KEY) || "null"),
    isAuthenticated: !!storage.getItem(TOKEN_KEY),
    loading: false,
    error: null,
    rememberMe,
    lastActivity: Date.now(),
    sessionExpired: false,
  };
};

const initialState = getInitialState();

// ==================== HELPER FUNCTIONS ====================
const saveAuthData = (token, refreshToken, user, rememberMe = false) => {
  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  storage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
};

const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
};

const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// ==================== ASYNC THUNKS ====================

/**
 * 🔐 Check Authentication Status
 */
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

      if (!token) {
        return rejectWithValue("No token found");
      }

      const response = await api.get("/auth/me");

      return {
        user: response.data.data,
        token,
      };
    } catch (error) {
      clearAuthData();
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * 📝 Register New User
 */
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);

      const { token, refreshToken, user } = response.data;

      saveAuthData(token, refreshToken, user, userData.rememberMe);

      // Custom toast with user name
      toast.success(
        <div>
          <strong>🎉 Welcome aboard, {user.name || user.email}!</strong>
          <p className="text-xs mt-1">
            Your account has been created successfully
          </p>
        </div>,
        { autoClose: 3000 }
      );

      return {
        user,
        token,
        refreshToken,
        rememberMe: userData.rememberMe || false,
      };
    } catch (error) {
      const message = getErrorMessage(error);

      // Different toast styles based on error type
      if (message.toLowerCase().includes("email")) {
        toast.error("❌ " + message, {
          autoClose: 5000,
          position: "top-center",
        });
      } else {
        toast.error("❌ " + message);
      }

      return rejectWithValue(message);
    }
  }
);

/**
 * 🔑 Login User
 */
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);

      const { token, refreshToken, user } = response.data;

      saveAuthData(token, refreshToken, user, credentials.rememberMe);

      // Welcome back message
      toast.success(
        <div>
          <strong>👋 Welcome back, {user.name || user.email}!</strong>
          <p className="text-xs mt-1">You've successfully logged in</p>
        </div>,
        {
          autoClose: 2000,
          icon: "🎊",
        }
      );

      return {
        user,
        token,
        refreshToken,
        rememberMe: credentials.rememberMe || false,
      };
    } catch (error) {
      const message = getErrorMessage(error);

      // Specific error handling
      if (message.toLowerCase().includes("password")) {
        toast.error("🔒 Incorrect password. Please try again.", {
          position: "top-center",
        });
      } else if (
        message.toLowerCase().includes("email") ||
        message.toLowerCase().includes("user")
      ) {
        toast.error("📧 User not found. Please check your email.", {
          position: "top-center",
        });
      } else {
        toast.error("❌ " + message);
      }

      return rejectWithValue(message);
    }
  }
);

/**
 * 🔄 Refresh Token
 */
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { rememberMe } = getState().auth;
      const storage = rememberMe ? localStorage : sessionStorage;
      const oldRefreshToken = storage.getItem(REFRESH_TOKEN_KEY);

      if (!oldRefreshToken) {
        return rejectWithValue("No refresh token found");
      }

      const response = await api.post("/auth/refresh", {
        refreshToken: oldRefreshToken,
      });

      const { token, refreshToken: newRefreshToken, user } = response.data;

      saveAuthData(token, newRefreshToken, user, rememberMe);

      return {
        user,
        token,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      clearAuthData();
      toast.warn("⏱️ Session expired. Please login again.", {
        position: "top-center",
      });
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * 🚪 Logout User
 */
export const logout = createAsyncThunk(
  "auth/logout",
  async (showToast = true, { rejectWithValue }) => {
    try {
      // Try to call logout API, but don't fail if it errors
      try {
        await api.post("/auth/logout");
      } catch (apiError) {
        console.warn("Logout API call failed:", apiError);
      }

      clearAuthData();

      if (showToast) {
        toast.info("👋 You've been logged out successfully", {
          position: "top-center",
          autoClose: 2000,
        });
      }

      return null;
    } catch (error) {
      // Even if there's an error, still clear local data
      clearAuthData();
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

/**
 * 👤 Update User Profile
 */
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const response = await api.put("/auth/profile", profileData);

      const { user } = response.data;
      const { rememberMe } = getState().auth;
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem(USER_KEY, JSON.stringify(user));

      toast.success("✅ Profile updated successfully!", {
        autoClose: 2000,
      });

      return user;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error("❌ " + message);
      return rejectWithValue(message);
    }
  }
);

/**
 * 🔐 Change Password
 */
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      await api.put("/auth/change-password", passwordData);

      toast.success(
        <div>
          <strong>🔒 Password changed successfully!</strong>
          <p className="text-xs mt-1">Your account is now more secure</p>
        </div>,
        { autoClose: 3000 }
      );

      return true;
    } catch (error) {
      const message = getErrorMessage(error);

      if (message.toLowerCase().includes("current")) {
        toast.error("❌ Current password is incorrect", {
          position: "top-center",
        });
      } else {
        toast.error("❌ " + message);
      }

      return rejectWithValue(message);
    }
  }
);

/**
 * 📧 Request Password Reset
 */
export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (email, { rejectWithValue }) => {
    try {
      await api.post("/auth/forgot-password", { email });

      toast.success(
        <div>
          <strong>📧 Reset email sent!</strong>
          <p className="text-xs mt-1">
            Check your inbox for password reset instructions
          </p>
        </div>,
        { autoClose: 5000 }
      );

      return true;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error("❌ " + message);
      return rejectWithValue(message);
    }
  }
);

/**
 * 🔄 Reset Password
 */
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      await api.post("/auth/reset-password", { token, password });

      toast.success(
        <div>
          <strong>✅ Password reset successful!</strong>
          <p className="text-xs mt-1">
            You can now login with your new password
          </p>
        </div>,
        { autoClose: 3000 }
      );

      return true;
    } catch (error) {
      const message = getErrorMessage(error);

      if (message.toLowerCase().includes("token")) {
        toast.error("⏱️ Reset link has expired. Please request a new one.", {
          position: "top-center",
          autoClose: 5000,
        });
      } else {
        toast.error("❌ " + message);
      }

      return rejectWithValue(message);
    }
  }
);

// ==================== SLICE ====================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Reset error state
     */
    resetError: (state) => {
      state.error = null;
    },

    /**
     * Update last activity timestamp
     */
    updateActivity: (state) => {
      state.lastActivity = Date.now();
    },

    /**
     * Set session expired flag
     */
    setSessionExpired: (state, action) => {
      state.sessionExpired = action.payload;
    },

    /**
     * Update user data locally (without API call)
     */
    updateUserLocal: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      const storage = state.rememberMe ? localStorage : sessionStorage;
      storage.setItem(USER_KEY, JSON.stringify(state.user));
    },

    /**
     * Clear error after a delay
     */
    clearErrorDelayed: (state) => {
      setTimeout(() => {
        state.error = null;
      }, 3000);
    },
  },

  extraReducers: (builder) => {
    builder
      // ==================== CHECK AUTH ====================
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.sessionExpired = false;
        state.lastActivity = Date.now();
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // ==================== REGISTER ====================
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.rememberMe = action.payload.rememberMe;
        state.lastActivity = Date.now();
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // ==================== LOGIN ====================
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.rememberMe = action.payload.rememberMe;
        state.lastActivity = Date.now();
        state.sessionExpired = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // ==================== REFRESH TOKEN ====================
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.sessionExpired = false;
        state.lastActivity = Date.now();
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.sessionExpired = true;
        state.error = action.payload;
      })

      // ==================== LOGOUT ====================
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.rememberMe = false;
        state.sessionExpired = false;
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout fails, clear the state
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.rememberMe = false;
      })

      // ==================== UPDATE PROFILE ====================
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== CHANGE PASSWORD ====================
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== PASSWORD RESET ====================
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ==================== EXPORTS ====================
export const {
  resetError,
  updateActivity,
  setSessionExpired,
  updateUserLocal,
  clearErrorDelayed,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectSessionExpired = (state) => state.auth.sessionExpired;

export default authSlice.reducer;
