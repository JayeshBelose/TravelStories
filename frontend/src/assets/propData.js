export const itineraries = [
    {
        id: 1,
        title: "Barcelona Beach & Culture",
        type: "Leisure",
        location: "Barcelona, Spain",
        thumbnail: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad",
        startDate: "01 Jan 2024",
        endDate: "05 Jan 2024",
        creator: "Carlos Rivera",
        members: ["Jayesh", "Riya", "Aman"],
        likes: 12,
        saves: 8,
        createdAt: "2024-01-01",
        days: [
            {
                dayNumber: 1,
                description: "Explore the Gothic Quarter and La Rambla.",
                locations: [
                    {
                        name: "La Rambla",
                        address: "La Rambla, Barcelona",
                        images: [
                            "https://images.unsplash.com/photo-1505761671935-60b3a7427bad",
                        ],
                    },
                ],
            },
            {
                dayNumber: 2,
                description: "Visit iconic landmarks.",
                locations: [
                    {
                        name: "Sagrada Familia",
                        address: "Carrer de Mallorca, Barcelona",
                        images: [
                            "https://images.unsplash.com/photo-1543340903-0b1e9f16d1a0",
                        ],
                    },
                ],
            },
        ],
    },

    {
        id: 2,
        title: "Tokyo City Explorer",
        type: "Cultural",
        location: "Tokyo, Japan",
        thumbnail: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26",
        startDate: "10 Feb 2024",
        endDate: "15 Feb 2024",
        creator: "Yuki Tanaka",
        members: ["Arjun", "Meera"],
        likes: 22,
        saves: 15,
        createdAt: "2023-12-15",
        days: [
            {
                dayNumber: 1,
                description: "Experience modern Tokyo.",
                locations: [
                    {
                        name: "Shibuya Crossing",
                        address: "Shibuya City, Tokyo",
                        images: [
                            "https://images.unsplash.com/photo-1549692520-acc6669e2f0c",
                        ],
                    },
                ],
            },
        ],
    },

    {
        id: 3,
        title: "Swiss Alps Adventure",
        type: "Adventure",
        location: "Zermatt, Switzerland",
        thumbnail: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
        startDate: "20 Mar 2024",
        endDate: "25 Mar 2024",
        creator: "Luca Steiner",
        members: ["Nina", "Karan", "Sophia"],
        likes: 35,
        saves: 27,
        createdAt: "2024-02-01",
        days: [
            {
                dayNumber: 1,
                description: "Arrival and scenic village walk.",
                locations: [
                    {
                        name: "Zermatt Village",
                        address: "Zermatt, Switzerland",
                        images: [
                            "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
                        ],
                    },
                ],
            },
        ],
    },

    {
        id: 4,
        title: "Bali Relax & Explore",
        type: "Leisure",
        location: "Bali, Indonesia",
        thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
        startDate: "05 Apr 2024",
        endDate: "10 Apr 2024",
        creator: "Putri Wijaya",
        members: ["Rahul", "Ananya", "Dev"],
        likes: 18,
        saves: 30,
        createdAt: "2024-01-20",
        days: [
            {
                dayNumber: 1,
                description: "Beach relaxation and sunset.",
                locations: [
                    {
                        name: "Seminyak Beach",
                        address: "Seminyak, Bali",
                        images: [
                            "https://images.unsplash.com/photo-1493558103817-58b2924bce98",
                        ],
                    },
                ],
            },
        ],
    },
];

export const savedItineraries = [
    {
        id: 1,
        title: "Barcelona Beach & Culture",
        type: "Leisure",
        location: "Barcelona, Spain",
        thumbnail: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad",
        startDate: "01 Jan 2024",
        endDate: "05 Jan 2024",
        creator: "Carlos Rivera",
        members: ["Jayesh", "Riya", "Aman"],
        likes: 12,
        saves: 8,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-03",
        visibility: "Public",
        days: [
            {
                dayNumber: 1,
                description: "Explore the Gothic Quarter and La Rambla.",
                locations: [
                    {
                        name: "La Rambla",
                        address: "La Rambla, Barcelona",
                        images: [
                            "https://images.unsplash.com/photo-1505761671935-60b3a7427bad",
                        ],
                    },
                ],
            },
        ],
    },

    {
        id: 2,
        title: "Tokyo City Explorer",
        type: "Cultural",
        location: "Tokyo, Japan",
        thumbnail: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26",
        startDate: "10 Feb 2024",
        endDate: "15 Feb 2024",
        creator: "Yuki Tanaka",
        members: ["Arjun", "Meera"],
        likes: 22,
        saves: 15,
        createdAt: "2023-12-15",
        updatedAt: "2023-12-17",
        visibility: "Public",
        days: [
            {
                dayNumber: 1,
                description: "Experience modern Tokyo.",
                locations: [
                    {
                        name: "Shibuya Crossing",
                        address: "Shibuya City, Tokyo",
                        images: [
                            "https://images.unsplash.com/photo-1549692520-acc6669e2f0c",
                        ],
                    },
                ],
            },
        ],
    },
];

export const usersData = [
    {
        id: 1,
        username: "carlos_rivera",
        profilePic: "https://i.pravatar.cc/150?img=11",
        itineraries: [
            {
                id: 101,
                title: "Barcelona Beach & Culture",
                location: "Barcelona, Spain",
                thumbnail: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad",
                startDate: "01 Jan 2024",
                endDate: "05 Jan 2024",
                creator: "Carlos Rivera",
                members: ["Jayesh", "Riya", "Aman"],
                likes: 12,
                saves: 8,
                createdAt: "2024-01-01",
                days: [
                    {
                        dayNumber: 1,
                        description: "Explore the Gothic Quarter and La Rambla.",
                        locations: [
                            {
                                name: "La Rambla",
                                address: "La Rambla, Barcelona",
                                images: [
                                    "https://images.unsplash.com/photo-1505761671935-60b3a7427bad",
                                ],
                            },
                        ],
                    },
                    {
                        dayNumber: 2,
                        description: "Visit iconic landmarks.",
                        locations: [
                            {
                                name: "Sagrada Familia",
                                address: "Carrer de Mallorca, Barcelona",
                                images: [
                                    "https://images.unsplash.com/photo-1543340903-0b1e9f16d1a0",
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },

    {
        id: 2,
        username: "sarah_traveler",
        profilePic: "https://i.pravatar.cc/150?img=32",
        itineraries: [
            {
                id: 201,
                title: "Paris Romantic Escape",
                location: "Paris, France",
                thumbnail: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
                startDate: "10 Feb 2024",
                endDate: "14 Feb 2024",
                creator: "Sarah Williams",
                members: ["Emma", "Olivia"],
                likes: 25,
                saves: 14,
                createdAt: "2024-02-01",
                days: [
                    {
                        dayNumber: 1,
                        description: "Eiffel Tower and Seine River cruise.",
                        locations: [
                            {
                                name: "Eiffel Tower",
                                address: "Champ de Mars, Paris",
                                images: [
                                    "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f",
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },

    {
        id: 3,
        username: "alex_nomad",
        profilePic: "https://i.pravatar.cc/150?img=45",
        itineraries: [
            {
                id: 301,
                title: "Himalayan Trek Adventure",
                location: "Manali, India",
                thumbnail: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
                startDate: "05 Mar 2024",
                endDate: "12 Mar 2024",
                creator: "Alex Johnson",
                members: ["Rohan", "Ishita"],
                likes: 40,
                saves: 21,
                createdAt: "2024-03-01",
                days: [
                    {
                        dayNumber: 1,
                        description: "Arrival and local sightseeing.",
                        locations: [
                            {
                                name: "Hadimba Temple",
                                address: "Old Manali, Himachal Pradesh",
                                images: [
                                    "https://images.unsplash.com/photo-1582653291997-079a1c04e5a1",
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },

    {
        id: 4,
        username: "lisa_journey",
        profilePic: "https://i.pravatar.cc/150?img=22",
        itineraries: [
            {
                id: 401,
                title: "Tokyo City Lights",
                location: "Tokyo, Japan",
                thumbnail: "https://images.unsplash.com/photo-1505060894488-0f0f6a70a4c2",
                startDate: "20 Apr 2024",
                endDate: "25 Apr 2024",
                creator: "Lisa Chen",
                members: ["Kenji", "Maya"],
                likes: 31,
                saves: 18,
                createdAt: "2024-04-01",
                days: [
                    {
                        dayNumber: 1,
                        description: "Shibuya crossing and night markets.",
                        locations: [
                            {
                                name: "Shibuya Crossing",
                                address: "Shibuya City, Tokyo",
                                images: [
                                    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9",
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
];
