import React, { useEffect, useState } from 'react';
import { authService } from '../services/Api';
import { User, Gift, Heart, Award } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  totalPoints: number;
  donationPoints: number;
  gamesPlayed: number;
  gamesWon: number;
}

interface Charity {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
}

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pointsToConvert, setPointsToConvert] = useState<number>(0);
  const [selectedCharity, setSelectedCharity] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Sample charities - in real app, these would come from an API
  const charities: Charity[] = [
    {
      id: '1',
      name: 'Music Education Foundation',
      description: 'Supports music education in schools',
      logoUrl: '/charity1.png'
    },
    {
      id: '2',
      name: 'Artists Relief Fund',
      description: 'Provides support to struggling musicians',
      logoUrl: '/charity2.png'
    },
    {
      id: '3',
      name: 'World Harmony',
      description: 'Brings music therapy to hospitals',
      logoUrl: '/charity3.png'
    }
  ];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authService.getProfile();
        setProfile(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load profile. Please try again.');
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 0) {
      setPointsToConvert(0);
    } else {
      // Ensure user can't convert more points than they have
      setPointsToConvert(Math.min(value, profile?.totalPoints || 0));
    }
  };

  const handleDonation = async () => {
    if (!profile || pointsToConvert <= 0 || !selectedCharity) {
      return;
    }
    
    try {
      // In a real app, this would be an API call
      // await authService.convertPoints({
      //   points: pointsToConvert,
      //   charityId: selectedCharity
      // });
      
      // Simulate a successful donation
      setProfile({
        ...profile,
        totalPoints: profile.totalPoints - pointsToConvert,
        donationPoints: (profile.donationPoints || 0) + pointsToConvert
      });
      
      setSuccessMessage(`Successfully donated ${pointsToConvert} points to ${
        charities.find(c => c.id === selectedCharity)?.name
      }!`);
      
      // Reset form
      setPointsToConvert(0);
      setSelectedCharity('');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
    } catch (err) {
      setError('Failed to process donation. Please try again.');
      console.error('Error making donation:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="bg-[#003399] text-white h-24 w-24 rounded-full flex items-center justify-center text-4xl">
            {profile?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold">{profile?.username || 'User'}</h1>
            <p className="text-gray-600">{profile?.email || 'email@example.com'}</p>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                <Award className="text-[#FFCC00]" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Total Points</p>
                  <p className="font-bold">{profile?.totalPoints || 0}</p>
                </div>
              </div>
              
              <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                <Gift className="text-[#003399]" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Games Played</p>
                  <p className="font-bold">{profile?.gamesPlayed || 0}</p>
                </div>
              </div>
              
              <div className="bg-gray-100 px-4 py-2 rounded-lg flex items-center gap-2">
                <Heart className="text-red-500" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Donated Points</p>
                  <p className="font-bold">{profile?.donationPoints || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Donation section */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Heart className="text-red-500" />
          Convert Points to Donations
        </h2>
        
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            {successMessage}
          </div>
        )}
        
        <p className="mb-6">
          Convert your quiz points into donations for music charities. Each point equals €0.10 in donations.
        </p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Select a Charity</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {charities.map(charity => (
                <div 
                  key={charity.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedCharity === charity.id ? 'border-[#003399] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCharity(charity.id)}
                >
                  <div className="h-12 w-12 bg-gray-200 rounded-full mb-3 mx-auto flex items-center justify-center">
                    <Heart size={24} className="text-red-500" />
                  </div>
                  <h3 className="font-medium text-center">{charity.name}</h3>
                  <p className="text-sm text-gray-500 text-center mt-1">{charity.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Points to Donate (Available: {profile?.totalPoints || 0})
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max={profile?.totalPoints || 0}
                value={pointsToConvert}
                onChange={handlePointsChange}
                className="w-full p-2 border rounded-lg"
              />
              <span className="text-gray-500 whitespace-nowrap">
                = €{(pointsToConvert * 0.1).toFixed(2)}
              </span>
            </div>
          </div>
          
          <button
            className={`w-full py-3 rounded-lg text-white ${
              pointsToConvert > 0 && selectedCharity 
                ? 'bg-[#003399] hover:bg-[#002266]' 
                : 'bg-gray-300 cursor-not-allowed'
            } transition-colors`}
            disabled={pointsToConvert <= 0 || !selectedCharity}
            onClick={handleDonation}
          >
            Donate Points
          </button>
        </div>
      </div>
    </div>
  );
};