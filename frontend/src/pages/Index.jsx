import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-cyan-200">
      {/* Header/Nav */}
      <header className="container mx-auto py-6 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <GraduationCap className="h-8 w-8 mr-2 text-blue-950 " />
          <h1 className="text-2xl font-bold text-black">EduLearn</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outlined"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
          <Button 
            variant='contained'
            onClick={() => navigate('/auth')}
          >
            Get Started
          </Button>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="container mx-auto py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Unlock Your Potential with E-Learning Excellence
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of students and instructors on our platform. 
            Access world-class courses, expert instructions and community support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant='contained'
              size="lg"
              className="hover:bg-edu-primary/90 text-white px-8"
              onClick={() => navigate('/auth')}
            >
              Create Free Account
            </Button>
            <Button 
              size="lg"
              variant="outlined"
              className="hover:bg-edu-primary/10"
            >
              Explore Courses
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-white border border-gray-100 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-gray-200  flex items-center justify-center mb-4">
              <BookOpen className="h-7 w-7 text-cyan-950" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Extensive Course Library</h3>
            <p className="text-gray-600">Access thousands of courses across various categories and disciplines.</p>
          </div>
          
          <div className="p-6 rounded-xl bg-white shadow-edu border border-gray-100 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-edu-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
            <p className="text-gray-600">Learn from industry professionals and academic experts in every field.</p>
          </div>
          
          <div className="p-6 rounded-xl bg-white shadow-edu border border-gray-100 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <Award className="h-7 w-7 text-blue-950 " />
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified Certificates</h3>
            <p className="text-gray-600">Earn recognized certificates to enhance your resume and career prospects.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
