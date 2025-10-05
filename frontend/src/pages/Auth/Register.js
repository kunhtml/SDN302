import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../redux/slices/authSlice";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(formData));
    if (!result.error) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                name="firstName"
                type="text"
                required
                className="input-field"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
              />
              <input
                name="lastName"
                type="text"
                required
                className="input-field"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <input
              name="email"
              type="email"
              required
              className="input-field"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              name="phone"
              type="tel"
              className="input-field"
              placeholder="Phone number (optional)"
              value={formData.phone}
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              required
              className="input-field"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700">
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
