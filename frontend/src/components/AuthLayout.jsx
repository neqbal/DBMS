import { Card } from "@mui/material";
import indexImage from "../assets/index.avif"
const AuthLayout = ({ children, image, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-edu-light">
      {/* Left Side - Image and branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-edu-primary to-edu-secondary">
        <div className="absolute inset-0 bg-blue-500"></div>
        <div className="relative z-10 flex flex-col justify-center items-center w-full h-full p-12 text-white">
          <img 
            src={image} 
            alt="Education Illustration" 
            className="w-3/4 h-auto mb-8 animate-fade-in drop-shadow-xl" 
          />
          <div className="text-center animate-slide-in">
            <h1 className="text-4xl font-bold mb-4 text-white">
              {title}
            </h1>
            <p className="text-xl opacity-90 max-w-md text-white">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
      
      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          {children}
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
