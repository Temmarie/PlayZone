# PlayZone 🎮

A modern gaming platform built with Next.js featuring classic games, user profiles, leaderboards, and score tracking.

## Features

- **6 Classic Games**: Play Tic Tac Toe, Rock Paper Scissors, Picture Matching, Snake, Tetris, and Word Puzzle
- **Score Tracking**: Track your performance and statistics across all games
- **Leaderboards**: Compete with other players and climb the rankings
- **User Profiles**: Personalized gaming experience with individual stats
- **Responsive Design**: Optimized for desktop and mobile devices
- **Dark Theme**: Modern dark UI with beautiful gradients and animations

## 🎮 Available Games

| Game                    | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| **Tic Tac Toe**         | Classic 3x3 grid game - get three in a row to win!                |
| **Rock Paper Scissors** | Beat the computer in this timeless game of chance and strategy    |
| **Picture Matching**    | Test your memory by matching pairs of hidden pictures             |
| **Snake**               | Guide the snake to eat food and grow longer without hitting walls |
| **Tetris**              | Arrange falling blocks to clear lines and achieve high scores     |
| **Word Puzzle**         | Find hidden words in a grid of letters to test your vocabulary    |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd gamez
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Run the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to start playing!

## Build & Deploy

### Deployment

    [View Demo]()

### Build for production

```bash
pnpm build
# or
npm run build
```

### Start production server

```bash
pnpm start
# or
npm start
```

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + CSS Animations
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Bricolage Grotesque
- **Validation**: Zod
- **Forms**: React Hook Form

## Project Structure

```
app/
├── api/scores/          # Score tracking API endpoints
├── components/          # Shared app components
├── games/              # Individual game pages
│   ├── picture-matching/
│   ├── rock-paper-scissors/
│   ├── snake/
│   ├── tetris/
│   ├── tic-tac-toe/
│   └── word-puzzle/
├── hooks/              # Custom React hooks
├── leaderboard/        # Leaderboard page
└── profile/           # User profile page

components/ui/          # Reusable UI components
hooks/                 # Shared hooks
lib/                   # Utility functions
public/               # Static assets
styles/               # Global styles
```

## Game Features

### Statistics Tracking

- Games played count
- Total score across all games
- Best winning streak
- Individual game performance

### Scoring System

- Each game has its own scoring mechanism
- Scores are tracked with timestamps
- Leaderboards show top performers
- Personal best tracking

### Responsive Gaming

- Touch-friendly controls for mobile
- Keyboard shortcuts for desktop
- Optimized performance across devices

## UI/UX Features

- **Dark Theme**: Beautiful dark interface with neon accents
- **Smooth Animations**: CSS animations and transitions
- **Gradient Backgrounds**: Each game has unique color schemes
- **Modern Typography**: Clean, readable fonts
- **Intuitive Navigation**: Easy-to-use sidebar navigation

## Development

### Available Scripts

| Command      | Description              |
| ------------ | ------------------------ |
| `pnpm dev`   | Start development server |
| `pnpm build` | Build for production     |
| `pnpm start` | Start production server  |
| `pnpm lint`  | Run ESLint               |

### Adding a New Game

1. Create a new folder in `app/games/your-game-name/`
2. Add a `page.tsx` file with your game component
3. Update the games array in `app/page.tsx`
4. Add appropriate scoring logic
5. Test across different screen sizes

## 🎯 Future Enhancements

- [ ] Multiplayer game modes
- [ ] Real-time leaderboards
- [ ] Achievement system
- [ ] Game replay functionality
- [ ] Social features (friends, challenges)
- [ ] More game variations
- [ ] Database integration
- [ ] User authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Author

👤 Grace Tamara Ekunola

- Github: @Temmarie
- Twitter: @TemmarieW
- Linkedin: Grace Tife Ekunola
- [Portfolio](temmarie.netlify.app)

## License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

If you have any questions or run into issues, please:

- Check the existing issues
- Create a new issue with detailed information
- Include steps to reproduce any bugs

---

**Happy Gaming! 🎮✨**
