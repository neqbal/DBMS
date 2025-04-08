import { useEffect } from 'react';
//import AuthForm from '@/components/AuthForm';
import AuthLayout from '../components/AuthLayout';
import { Form } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

// You can replace this with your actual image
const learningImage = "https://img.freepik.com/free-vector/online-certification-illustration_23-2148575636.jpg";

const AuthPage = () => {
  useEffect(() => {
    document.title = "Sign In | EduLearn Platform";
  }, []);

  return (
    <AuthLayout 
      image={learningImage}
      title="Expand Your Knowledge"
      subtitle="Access thousands of courses and join our global community of lifelong learners."
    >
      <AuthForm />
    </AuthLayout>
  );
};

export default AuthPage;
