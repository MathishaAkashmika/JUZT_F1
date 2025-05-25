# JUZT F1 Dashboard

A modern Formula 1 data visualization dashboard built with [Next.js](https://nextjs.org) and bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Real-time F1 Data**: Integration with F1 APIs for live race data
- **Interactive Charts**: Lap time visualization and session data analysis
- **Driver Dashboard**: Comprehensive driver statistics and performance metrics
- **Responsive Design**: Built with Tailwind CSS for optimal viewing on all devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended package manager)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   Copy the `.env` file and configure the following variables:

```env
NEXT_PUBLIC_F1_API_BASE_URL=https://f1api.dev/api
NEXT_PUBLIC_OPENF1_API_BASE_URL=https://api.openf1.org/v1
NEXT_PUBLIC_ANYTHINGLLM_API_URL=
```

4. Run the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   └── drivers/           # Drivers page
├── components/            # React components
│   ├── LapChart.tsx      # Lap time visualization
│   ├── SessionData.tsx   # Session data display
│   ├── dashboard/        # Dashboard-specific components
│   └── ui/               # Reusable UI components
└── lib/                  # Utilities and API clients
    ├── f1-api/          # F1 API integration
    └── utils/           # Helper functions
```

## API Integration

This project integrates with multiple F1 data sources:

- **F1 API Dev**: Official F1 data and statistics
- **OpenF1 API**: Real-time telemetry and timing data
- **AnythingLLM**: AI-powered insights and analysis

## Development

You can start editing the pages by modifying files in the `src/app/` directory. The application auto-updates as you edit files.

### Key Components

- [`LapChart.tsx`](src/components/LapChart.tsx) - Interactive lap time visualization
- [`SessionData.tsx`](src/components/SessionData.tsx) - Real-time session information
- Dashboard components in [`src/components/dashboard/`](src/components/dashboard/)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [F1 API Documentation](https://f1api.dev/) - Formula 1 data API
- [OpenF1 API](https://openf1.org/) - Real-time F1 telemetry

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Remember to configure your environment variables in the Vercel dashboard before deploying.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.