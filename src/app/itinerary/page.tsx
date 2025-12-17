"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { parse } from "papaparse";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import jsPDF from 'jspdf';
import InternalLinksFooter from "../components/InternalLinksFooter";
import {
  Clock,
  Star,
  Sparkles,
  Download,
  Share2,
  Plus,
  Minus,
  GripVertical,
} from "lucide-react";

type Activity = {
  id: string;
  activity: string;
  localName: string;
  description: string;
  location: string;
  duration: string;
  tags: string;
  rating: number;
  image?: string;
};

type ItineraryDay = {
  day: number;
  date: string;
  activities: Activity[];
  totalDuration: string;
  theme: string;
};

type ItineraryPreferences = {
  destination: string;
  duration: number;
  travelers: number;
  budget: 'budget' | 'mid-range' | 'luxury';
  interests: string[];
  pace: 'relaxed' | 'moderate' | 'intensive';
};

const ItineraryGenerator = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<ItineraryDay[]>([]);
  const itineraryRef = useRef<HTMLDivElement>(null);

  const [preferences, setPreferences] = useState<ItineraryPreferences>({
    destination: '',
    duration: 3,
    travelers: 2,
    budget: 'mid-range',
    interests: [],
    pace: 'moderate'
  });

  const locations = ["Bali", "Jakarta", "Yogyakarta", "Lombok", "Surabaya"];
  const interestOptions = [
    "Cultural & Historical",
    "Nature & Adventure",
    "Food & Dining",
    "Photography",
    "Religious Sites",
    "Beach & Water Sports",
    "Art & Museums",
    "Shopping",
    "Nightlife"
  ];


  // Load activities data
  useEffect(() => {
    async function fetchActivities() {
      try {
        const response = await fetch('/activities.csv');
        const csvText = await response.text();
        const parsedData = parse(csvText, { header: true });

        const activitiesData = (parsedData.data as Record<string, unknown>[]).map((item) => ({
          id: String(item.id || ""),
          activity: String(item.activity || ""),
          localName: String(item.localName || ""),
          description: String(item.description || ""),
          location: String(item.location || ""),
          duration: String(item.duration || ""),
          tags: String(item.tags || ""),
          rating: Number(item.rating) || 0,
          image: item.image ? String(item.image) : undefined,
        }));

        setActivities(activitiesData);
      } catch (error) {
        console.error("Error loading activities:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gemini API integration
  const generateItinerary = async () => {
    setGenerating(true);
    
    try {
      // Filter activities by destination
      const destinationActivities = activities.filter(
        activity => activity.location.toLowerCase().includes(preferences.destination.toLowerCase())
      );

      // Sort by rating and filter by interests
      const relevantActivities = destinationActivities
        .filter(activity => {
          if (preferences.interests.length === 0) return true;
          return preferences.interests.some(interest => 
            activity.tags.toLowerCase().includes(interest.toLowerCase()) ||
            activity.description.toLowerCase().includes(interest.toLowerCase())
          );
        })
        .sort((a, b) => b.rating - a.rating);

      // Prepare activities data for AI
      const activitiesData = relevantActivities.slice(0, 20).map(activity => ({
        id: activity.id,
        name: activity.activity,
        localName: activity.localName,
        description: activity.description,
        location: activity.location,
        duration: activity.duration,
        rating: activity.rating,
        tags: activity.tags
      }));

      // Check if API key is available
      const apiKey = process.env.NEXT_PUBLIC_ARK_API_KEY;
      if (!apiKey) {
        throw new Error('Ark API key not configured. Please set NEXT_PUBLIC_ARK_API_KEY environment variable.');
      }

      // Create prompt for AI
      const prompt = `You are a travel expert specializing in Indonesia. Create a ${preferences.duration}-day itinerary for ${preferences.destination} based on these preferences:

- Travelers: ${preferences.travelers} ${preferences.travelers === 1 ? 'person' : 'people'}
- Budget: ${preferences.budget}
- Interests: ${preferences.interests.join(', ') || 'General sightseeing'}
- Pace: ${preferences.pace} (${preferences.pace === 'relaxed' ? '2-3' : preferences.pace === 'moderate' ? '3-4' : '4-5'} activities per day)

Available activities:
${activitiesData.map(a => `- ${a.name} (${a.localName}) - ${a.description} | Duration: ${a.duration} | Rating: ${a.rating} | Tags: ${a.tags}`).join('\n')}

Please create a detailed itinerary in JSON format with this structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "Monday, December 16",
      "theme": "Cultural Discovery",
      "activities": [
        {
          "id": "activity_id",
          "activity": "Activity Name",
          "localName": "Local Name",
          "description": "Description",
          "location": "Location",
          "duration": "Duration",
          "rating": 4.5,
          "tags": "tags"
        }
      ]
    }
  ]
}

Rules:
1. Use ONLY activities from the provided list
2. Select activities that match the interests and budget
3. Ensure logical flow and proximity for each day
4. Vary the themes across days
5. Respect the pace preference
6. Generate exactly ${preferences.duration} days
7. Return ONLY the JSON, no additional text`;

      // Call BytePlus Ark API via fetch
      const result = await fetch('https://ark.ap-southeast.bytepluses.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'seed-1-6-250915',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!result.ok) {
        throw new Error(`API Error: ${result.status} ${result.statusText}`);
      }

      const response = await result.json();
      const text = response.choices[0].message.content;
      
      // Parse the AI response and format it
      let aiItinerary;
      try {
        // Try to parse the response directly
        aiItinerary = JSON.parse(text);
      } catch {
        // Fallback to regex parsing if JSON parsing fails
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            aiItinerary = JSON.parse(jsonMatch[0]);
          } catch {
            throw new Error('Invalid AI response format');
          }
        } else {
          throw new Error('No valid JSON found in AI response');
        }
      }

      // Format the itinerary data
      const formattedItinerary: ItineraryDay[] = aiItinerary.itinerary.map((day: { theme?: string; activities: Activity[] }, index: number) => ({
        day: index + 1,
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        }),
        theme: day.theme || `Day ${index + 1}`,
        totalDuration: `${day.activities.length * 3} hours`,
        activities: day.activities.map((activity: Activity) => ({
          id: activity.id,
          activity: activity.activity,
          localName: activity.localName,
          description: activity.description,
          location: activity.location,
          duration: activity.duration,
          rating: activity.rating,
          tags: activity.tags
        }))
      }));

      setGeneratedItinerary(formattedItinerary);
      
    } catch (error) {
      console.error('Error generating itinerary:', error);
      
      // Show specific error messages to user
      let errorMessage = 'Failed to generate itinerary. ';
      
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          errorMessage += 'API key not configured properly.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage += 'Invalid API key or unauthorized access.';
        } else if (error.message.includes('429')) {
          errorMessage += 'API quota exceeded or rate limited. Please try again later.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Network error. Please check your internet connection.';
        } else {
          errorMessage += 'Using fallback recommendation system.';
        }
      }
      
      // Show error to user (you could add a state for this)
      alert(errorMessage);
      
      // Fallback to manual generation if API fails
      const activitiesPerDay = preferences.pace === 'relaxed' ? 2 : preferences.pace === 'moderate' ? 3 : 4;
      const fallbackItinerary: ItineraryDay[] = [];
      
      const destinationActivities = activities.filter(
        activity => activity.location.toLowerCase().includes(preferences.destination.toLowerCase())
      ).sort((a, b) => b.rating - a.rating);
      
      for (let day = 1; day <= preferences.duration; day++) {
        const startIndex = (day - 1) * activitiesPerDay;
        const dayActivities = destinationActivities.slice(startIndex, startIndex + activitiesPerDay);
        
        const themes = ["Cultural Discovery", "Nature & Adventure", "Local Experiences", "Hidden Gems"];
        
        fallbackItinerary.push({
          day,
          date: new Date(Date.now() + (day - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          }),
          activities: dayActivities,
          totalDuration: `${dayActivities.length * 3} hours`,
          theme: themes[(day - 1) % themes.length]
        });
      }
      
      setGeneratedItinerary(fallbackItinerary);
    } finally {
      setGenerating(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  // Drag and drop handler
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Parse the droppableId to get day and activity info
    const sourceDayIndex = parseInt(source.droppableId.split('-')[1]);
    const destDayIndex = parseInt(destination.droppableId.split('-')[1]);
    
    const newItinerary = [...generatedItinerary];
    
    if (sourceDayIndex === destDayIndex) {
      // Reordering within the same day
      const dayActivities = [...newItinerary[sourceDayIndex].activities];
      const [movedActivity] = dayActivities.splice(source.index, 1);
      dayActivities.splice(destination.index, 0, movedActivity);
      
      newItinerary[sourceDayIndex] = {
        ...newItinerary[sourceDayIndex],
        activities: dayActivities
      };
    } else {
      // Moving between different days
      const sourceActivities = [...newItinerary[sourceDayIndex].activities];
      const destActivities = [...newItinerary[destDayIndex].activities];
      
      const [movedActivity] = sourceActivities.splice(source.index, 1);
      destActivities.splice(destination.index, 0, movedActivity);
      
      newItinerary[sourceDayIndex] = {
        ...newItinerary[sourceDayIndex],
        activities: sourceActivities
      };
      
      newItinerary[destDayIndex] = {
        ...newItinerary[destDayIndex],
        activities: destActivities
      };
    }
    
    setGeneratedItinerary(newItinerary);
  };

  // Download as JSON
  const downloadJSON = () => {
    const dataStr = JSON.stringify(generatedItinerary, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${preferences.destination || 'Indonesia'}-itinerary.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Download as PDF with custom design
  const downloadPDF = async () => {
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Colors matching the website theme (updated for better brand alignment)
      const primaryColor = [99, 102, 241]; // indigo-500 - main brand color
      const primaryDarkColor = [67, 56, 202]; // indigo-600 - darker variant
      const secondaryColor = [16, 185, 129]; // emerald-500 - accent color
      const neutralColor = [107, 114, 128]; // neutral-500
      const lightColor = [243, 244, 246]; // neutral-100
      
      let currentY = margin;
      let pageNumber = 1;
      
      // Helper function to add new page
      const addNewPage = () => {
        pdf.addPage();
        pageNumber++;
        currentY = margin;
        addHeader();
      };
      
      // Header function
      const addHeader = (isFirstPage = false) => {
        // Brand header bar (on every page)
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(margin, currentY, contentWidth, 12, 'F');
        
        // Brand text
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('thingstodo.id', margin + 5, currentY + 8);
        
        // Page indicator on right (if not first page)
        if (!isFirstPage) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const pageText = `${preferences.destination || 'Indonesia'} Itinerary`;
          const pageTextWidth = pdf.getTextWidth(pageText);
          pdf.text(pageText, pageWidth - margin - pageTextWidth - 5, currentY + 8);
        }
        
        currentY += 20;
        
        // Only show full title and details on first page
        if (isFirstPage) {
          // Trip title with icon
          pdf.setTextColor(primaryDarkColor[0], primaryDarkColor[1], primaryDarkColor[2]);
          pdf.setFontSize(26);
          pdf.setFont('helvetica', 'bold');
          const title = `${preferences.destination || 'Indonesia'} Itinerary`;
          pdf.text(title, margin, currentY);
          
          currentY += 12;
          
          // Trip details in a colored box
          pdf.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
          pdf.rect(margin, currentY, contentWidth, 8, 'F');
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(neutralColor[0], neutralColor[1], neutralColor[2]);
          const details = `${preferences.duration} ${preferences.duration === 1 ? 'day' : 'days'} • ${preferences.travelers} ${preferences.travelers === 1 ? 'traveler' : 'travelers'} • ${preferences.pace} pace`;
          pdf.text(details, margin + 3, currentY + 5);
          
          currentY += 15;
          
          // Decorative divider
          pdf.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          pdf.setLineWidth(1);
          pdf.line(margin, currentY, pageWidth - margin, currentY);
          
          currentY += 10;
        } else {
          currentY += 5;
        }
      };
      
      // Footer function
      const addFooter = () => {
        // Footer background
        pdf.setFillColor(lightColor[0], lightColor[1], lightColor[2]);
        pdf.rect(margin, pageHeight - 15, contentWidth, 10, 'F');
        
        pdf.setFontSize(9);
        pdf.setTextColor(neutralColor[0], neutralColor[1], neutralColor[2]);
        pdf.setFont('helvetica', 'normal');
        
        // Page number with cute icon
        pdf.text(`Page ${pageNumber}`, pageWidth - margin - 20, pageHeight - 8);
        
        // Generated by with brand
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFont('helvetica', 'bold');
        pdf.text('thingstodo.id', margin + 3, pageHeight - 8);
        
        // Date
        pdf.setTextColor(neutralColor[0], neutralColor[1], neutralColor[2]);
        pdf.setFont('helvetica', 'normal');
        const date = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        pdf.text(`Generated ${date}`, margin + 3, pageHeight - 3);
      };
      
      // Add initial header (first page)
      addHeader(true);
      
      // Process each day
      generatedItinerary.forEach((day, dayIndex) => {
        // Check if we need a new page for the day
        if (currentY > pageHeight - 100) {
          addFooter();
          addNewPage();
        }
        
        // Day header with gradient effect
        pdf.setFillColor(primaryDarkColor[0], primaryDarkColor[1], primaryDarkColor[2]);
        pdf.rect(margin, currentY, contentWidth, 14, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(15);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Day ${day.day}`, margin + 5, currentY + 9);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(day.date, margin + 60, currentY + 9);
        
        // Theme on the right with emoji
        const themeText = day.theme;
        const themeWidth = pdf.getTextWidth(themeText);
        pdf.text(themeText, pageWidth - margin - themeWidth - 5, currentY + 9);
        
        currentY += 20;
        
        // Activities
        day.activities.forEach((activity, activityIndex) => {
          // Check if we need a new page for this activity
          if (currentY > pageHeight - 60) {
            addFooter();
            addNewPage();
          }
          
          // Activity number circle with border
          pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          pdf.circle(margin + 6, currentY + 6, 4, 'F');
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text((activityIndex + 1).toString(), margin + 4, currentY + 8);
          
          // Activity content
          const activityStartX = margin + 15;
          const activityWidth = contentWidth - 15;
          
          // Activity title
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          const titleLines = pdf.splitTextToSize(activity.activity, activityWidth);
          pdf.text(titleLines, activityStartX, currentY + 5);
          
          let activityY = currentY + 5 + (titleLines.length * 5);
          
          // Local name (if different)
          if (activity.localName && activity.localName !== activity.activity) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            pdf.text(`(${activity.localName})`, activityStartX, activityY);
            activityY += 5;
          }
          
          // Description
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(55, 65, 81); // neutral-700
          const descLines = pdf.splitTextToSize(activity.description, activityWidth);
          pdf.text(descLines, activityStartX, activityY);
          activityY += descLines.length * 4;
          
          // Duration and rating
          pdf.setFontSize(9);
          pdf.setTextColor(neutralColor[0], neutralColor[1], neutralColor[2]);
          pdf.setFont('helvetica', 'normal');
          
          // Duration
          pdf.text(`Duration: ${activity.duration}`, activityStartX, activityY + 5);
          
          // Rating
          const durationWidth = pdf.getTextWidth(`Duration: ${activity.duration}`);
          pdf.setTextColor(255, 193, 7); // Amber color for rating
          pdf.text(`Rating: ${activity.rating}`, activityStartX + durationWidth + 10, activityY + 5);
          
          // Location
          const ratingWidth = pdf.getTextWidth(`Rating: ${activity.rating}`);
          pdf.setTextColor(neutralColor[0], neutralColor[1], neutralColor[2]);
          pdf.text(`Location: ${activity.location}`, activityStartX + durationWidth + ratingWidth + 20, activityY + 5);
          
          currentY = activityY + 15;
          
          // Activity separator line
          if (activityIndex < day.activities.length - 1) {
            pdf.setDrawColor(229, 231, 235);
            pdf.setLineWidth(0.3);
            pdf.line(activityStartX, currentY, pageWidth - margin, currentY);
            currentY += 5;
          }
        });
        
        currentY += 10;
        
        // Day separator (if not last day)
        if (dayIndex < generatedItinerary.length - 1) {
          pdf.setDrawColor(203, 213, 225);
          pdf.setLineWidth(1);
          pdf.line(margin, currentY, pageWidth - margin, currentY);
          currentY += 15;
        }
      });
      
      // Add summary section
      if (currentY > pageHeight - 80) {
        addFooter();
        addNewPage();
      }
      
      // Summary header
      pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      pdf.rect(margin, currentY, contentWidth, 12, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Trip Summary', margin + 5, currentY + 8);
      
      currentY += 20;
      
      // Summary content
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const totalActivities = generatedItinerary.reduce((sum, day) => sum + day.activities.length, 0);
      const avgRating = generatedItinerary.reduce((sum, day) => 
        sum + day.activities.reduce((daySum, activity) => daySum + activity.rating, 0), 0
      ) / totalActivities;
      
      const summaryItems = [
        `Total Activities: ${totalActivities}`,
        `Average Rating: ${avgRating.toFixed(1)}/5.0`,
        `Trip Duration: ${preferences.duration} ${preferences.duration === 1 ? 'day' : 'days'}`,
        `Travel Style: ${preferences.pace} pace`,
        `Budget Range: ${preferences.budget}`,
        ...(preferences.interests.length > 0 ? [`Interests: ${preferences.interests.join(', ')}`] : [])
      ];
      
      summaryItems.forEach((item, index) => {
        pdf.text(`• ${item}`, margin + 5, currentY + (index * 5));
      });
      
      // Add final footer
      addFooter();
      
      // Save the PDF
      pdf.save(`${preferences.destination || 'Indonesia'}-itinerary.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading itinerary generator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              thingstodo<span className="text-sm text-neutral-500">.id</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Browse Activities
              </Link>
              <Link href="/itinerary" className="text-primary-600 font-medium">
                Plan Itinerary
              </Link>
              <Link href="/esim" className="text-neutral-600 hover:text-primary-600 transition-colors">
                Travel eSIM
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-accent-500" />
            <h1 className="text-4xl font-bold text-neutral-900">AI Itinerary Generator</h1>
          </div>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Let our AI create the perfect itinerary based on your preferences and our curated activities
          </p>
        </div>

        {/* Side by Side Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Side - Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-500" />
                Plan Your Trip
              </h2>
              <div className="space-y-6">
                
                {/* Destination */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Where do you want to go?
                  </label>
                  <select
                    value={preferences.destination}
                    onChange={(e) => setPreferences(prev => ({ ...prev, destination: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select destination</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Duration and Travelers */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Trip Duration
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, duration: Math.max(1, prev.duration - 1) }))}
                        className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 bg-neutral-50 rounded-lg font-medium">
                        {preferences.duration} {preferences.duration === 1 ? 'day' : 'days'}
                      </span>
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, duration: Math.min(10, prev.duration + 1) }))}
                        className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Travelers
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, travelers: Math.max(1, prev.travelers - 1) }))}
                        className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 bg-neutral-50 rounded-lg font-medium">
                        {preferences.travelers} {preferences.travelers === 1 ? 'person' : 'people'}
                      </span>
                      <button
                        onClick={() => setPreferences(prev => ({ ...prev, travelers: Math.min(10, prev.travelers + 1) }))}
                        className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Budget Range
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'budget', label: 'Budget', desc: 'Free - $50/day' },
                      { key: 'mid-range', label: 'Mid-range', desc: '$50 - $150/day' },
                      { key: 'luxury', label: 'Luxury', desc: '$150+/day' }
                    ].map(option => (
                      <button
                        key={option.key}
                        onClick={() => setPreferences(prev => ({ ...prev, budget: option.key as 'budget' | 'mid-range' | 'luxury' }))}
                        className={`p-4 rounded-lg border text-center transition-all ${
                          preferences.budget === option.key
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-neutral-500 mt-1">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    What interests you? (Select multiple)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {interestOptions.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          preferences.interests.includes(interest)
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pace */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Travel Pace
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'relaxed', label: 'Relaxed', desc: '2-3 activities/day' },
                      { key: 'moderate', label: 'Moderate', desc: '3-4 activities/day' },
                      { key: 'intensive', label: 'Intensive', desc: '4-5 activities/day' }
                    ].map(option => (
                      <button
                        key={option.key}
                        onClick={() => setPreferences(prev => ({ ...prev, pace: option.key as 'relaxed' | 'moderate' | 'intensive' }))}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          preferences.pace === option.key
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-neutral-500 mt-1">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateItinerary}
                  disabled={!preferences.destination || generating}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium text-lg transition-colors flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate AI Itinerary
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Side - Generated Itinerary */}
          <div className="space-y-6">
            {generatedItinerary.length > 0 ? (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-neutral-900 mb-1">
                        Your {preferences.destination || 'Indonesia'} Itinerary
                      </h2>
                      <p className="text-neutral-600 text-sm">
                        {preferences.duration} {preferences.duration === 1 ? 'day' : 'days'} • {preferences.travelers} {preferences.travelers === 1 ? 'traveler' : 'travelers'} • {preferences.pace} pace
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative group">
                        <button 
                          onClick={downloadPDF}
                          className="p-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg transition-colors"
                          title="Download as PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="relative group">
                        <button 
                          onClick={downloadJSON}
                          className="p-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
                          title="Download as JSON"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Itinerary Days with Drag and Drop */}
                  <div ref={itineraryRef} className="space-y-4 max-h-[600px] overflow-y-auto">
                    <DragDropContext onDragEnd={handleDragEnd}>
                      {generatedItinerary.map((day, dayIndex) => (
                        <div key={day.day} className="border border-neutral-200 rounded-xl overflow-hidden">
                          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-bold">Day {day.day}</h3>
                                <p className="text-primary-100 text-sm">{day.date}</p>
                              </div>
                              <div className="text-xs text-primary-200">{day.theme}</div>
                            </div>
                          </div>

                          <Droppable droppableId={`day-${dayIndex}`}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`p-4 space-y-3 transition-colors ${
                                  snapshot.isDraggingOver ? 'bg-blue-50' : ''
                                }`}
                              >
                                {day.activities.map((activity, index) => (
                                  <Draggable
                                    key={activity.id}
                                    draggableId={activity.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                                          snapshot.isDragging
                                            ? 'bg-white shadow-lg border-2 border-primary-200 rotate-1'
                                            : 'bg-neutral-50 hover:bg-neutral-100'
                                        }`}
                                      >
                                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                          <span className="text-primary-700 font-bold text-sm">{index + 1}</span>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-medium text-neutral-900 text-sm mb-1 truncate">{activity.activity}</h4>
                                          <p className="text-xs text-neutral-600 mb-2 line-clamp-2">{activity.description}</p>
                                          
                                          <div className="flex items-center gap-3 text-xs text-neutral-500">
                                            <div className="flex items-center gap-1">
                                              <Clock className="w-3 h-3" />
                                              {activity.duration}
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <Star className="w-3 h-3 text-accent-500 fill-accent-500" />
                                              {activity.rating}
                                            </div>
                                          </div>
                                        </div>

                                        <div
                                          {...provided.dragHandleProps}
                                          className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing"
                                        >
                                          <GripVertical className="w-4 h-4" />
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      ))}
                    </DragDropContext>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">Ready to Plan?</h3>
                <p className="text-neutral-600 text-sm">
                  Fill in your preferences on the left to generate your perfect itinerary!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Internal Links Footer */}
      <InternalLinksFooter />

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-neutral-600">
                &copy; {new Date().getFullYear()} ThingsToDo.id
              </p>
              <p className="text-sm text-neutral-500 mt-1">
                Discover the best of Indonesia
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ItineraryGenerator;