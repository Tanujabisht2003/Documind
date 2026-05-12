import Card from '@mui/material/Card';
import './quiz-view.css';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import highscore from './assets/highscore.png'

const labels = ['A', 'B', 'C', 'D'];

export default function QuizView({ data }) {
  const quizQuestions = data?.quiz || [];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showIsCorrect, setShowIsCorrect] = useState(false);

  if (!quizQuestions.length) {
    return (
      <p className='text-center text-muted-foreground'>No quiz data found.</p>
    );
  }
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setQuizCompleted(false);
    setScore(0);
    setShowIsCorrect(false);
  };

  const selectOption = (i) => {
    setSelectedOption(i);
  };

  const submitOption = () => {
    if (selectedOption === null) return;

    let newScore = score;

    const correctIndex = quizQuestions[currentQuestion].correct - 1;

    if (selectedOption === correctIndex) {
      newScore += 1;
    }

    setScore(newScore);
    setShowIsCorrect(true);

    setTimeout(() => {
      setShowIsCorrect(false);

      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        setQuizCompleted(true);
      }
    }, 800);
  };


  return (
    <div className='box1'>
      {!quizCompleted ? (
        <Card
          variant='outlined'
          sx={{
            width: 800,
            height: 500,
            borderRadius: 5,
            border: '1px solid #E1E6EF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.09)',
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              paddingTop: '35px',
            }}
          >
            <Typography sx={{ fontWeight: 'bold' }}>
              Question {currentQuestion + 1} of {quizQuestions.length}
            </Typography>
            <Typography sx={{ color: 'rgba(0, 0, 0, 0.5)' }}>
              Select the best answer based on the document content
            </Typography>
            <Typography sx={{ fontWeight: '400', fontSize: 24, lineHeight: 1 }}>
              {quizQuestions[currentQuestion]?.question}
            </Typography>
          </CardContent>
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
          >
            {quizQuestions[currentQuestion]?.options.map((opt, i) => (
              <Button
                className={selectedOption === i ? 'option selected' : 'option'}
                variant='outlined'
                onClick={() => selectOption(i)}
                sx={{ border: '1px solid #E1E6EF', borderRadius: '12px' }}
              >
                <div className='part1'>{labels[i]}</div>
                <div className='part2'>
                  <div className='part3'>{opt}</div>
                </div>
              </Button>
            ))}
          </CardContent>
          <CardActions
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '12px 24px 24px',
            }}
          >
            <Button
              type='submit'
              onClick={submitOption}
              disabled={selectedOption === null}
              variant='contained'
              sx={{
                width: '120px',
                textTransform: 'none',
                height: '45px',
                fontSize: '18px',
              }}
            >
              {currentQuestion < quizQuestions.length - 1 ? 'Next' : 'Submit'}
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Card
          variant='outlined'
          sx={{ width: 470, height: 350, borderRadius: 5, padding: 4 }}
        >
          <CardContent>
            <div>
              <div>
                <div className='final'>
                  <img
                    src={highscore}
                    alt='logo'
                    style={{ width: '100px', height: '100px' }}
                  />
                  <p className='marks'>
                    You got {Math.round((score / quizQuestions.length) * 100)}%
                    in your test
                  </p>
                  <p className='compliment'>
                    {score === quizQuestions.length
                      ? 'Perfect score! Excellent understanding of the material.'
                      : score >= quizQuestions.length / 2
                      ? 'Good job! You have a solid understanding of the material.'
                      : "Keep studying! You'll improve with practice."}
                  </p>
                </div>
              </div>
              {score === quizQuestions.length && (
                <div>
                  <div>🎉</div>
                </div>
              )}
            </div>
          </CardContent>
          <CardActions
            sx={{
              display: 'flex',
              justifyContent: 'center',
              // alignItems: 'center',
            }}
          >
            <Button
              onClick={resetQuiz}
              data-cursor='button'
              data-cursor-text='Restart Quiz'
              variant='contained'
              size='large'
              sx={{
                width: '420px',
                textTransform: 'none',
                fontSize: '18px',
              }}
            >
              Restart Quiz
            </Button>
          </CardActions>
        </Card>
      )}
    </div>
  );
}
