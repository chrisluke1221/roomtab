import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  Calculator, 
  Shield, 
  Zap, 
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Group Management',
      description: 'Create rooms and invite friends to manage shared expenses together.'
    },
    {
      icon: Calculator,
      title: 'Smart Splitting',
      description: 'Automatically calculate who owes what with our intelligent splitting algorithm.'
    },
    {
      icon: DollarSign,
      title: 'Expense Tracking',
      description: 'Track all your shared expenses in one place with detailed history.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. Only room members can see expenses.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications when expenses are added or settled.'
    },
    {
      icon: CheckCircle,
      title: 'Easy Settlements',
      description: 'Mark expenses as paid and keep track of who has settled up.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'College Student',
      content: 'RoomTab made splitting rent and utilities with my roommates so much easier. No more awkward conversations about money!',
      rating: 5
    },
    {
      name: 'Mike R.',
      role: 'Apartment Manager',
      content: 'I manage multiple shared apartments and RoomTab has been a game-changer for keeping track of all the expenses.',
      rating: 5
    },
    {
      name: 'Emma L.',
      role: 'Traveler',
      content: 'Perfect for group trips! We use it to split accommodation, food, and activities. Highly recommend!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6"
            >
              Split Bills with
              <span className="text-primary-600"> Friends</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto"
            >
              Keep track of shared expenses with roommates and friends. 
              Split bills, track who owes what, and settle up easily.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/create-room"
                    className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/join-room"
                    className="btn-secondary text-lg px-8 py-3"
                  >
                    Join Existing Room
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Everything you need to manage shared expenses
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              RoomTab provides all the tools you need to split bills and track expenses with friends and roommates.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Loved by roommates everywhere
            </h2>
            <p className="text-xl text-secondary-600">
              See what our users have to say about RoomTab
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-secondary-600 mb-4">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-secondary-900">{testimonial.name}</p>
                  <p className="text-sm text-secondary-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start splitting bills?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of roommates who are already using RoomTab to manage their shared expenses.
          </p>
          <Link
            to={isAuthenticated ? "/dashboard" : "/create-room"}
            className="inline-flex items-center space-x-2 bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-secondary-50 transition-colors duration-200"
          >
            <span>{isAuthenticated ? "Go to Dashboard" : "Get Started Free"}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;