import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Card, CardContent, Typography,
  Divider, Box, Button, CircularProgress, Alert
} from '@mui/material';

export default function App() {
  const [data, setData] = useState(null);         
  const [selected, setSelected] = useState(null); 
  const [result,   setResult]   = useState(null); 
  const [submitting, setSubmitting] = useState(false);

  const API_URL   = import.meta.env.VITE_API_URL;
  const API_GUESS = import.meta.env.VITE_API_GUESS_URL;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(API_URL);
        setData(data);                            
      } catch (err) {
        console.error(err);
        setData({ id: null, facts: [] });
      }
    })();
  }, [API_URL]);

  const handleSelect = (idx) => {
    if (!submitting && !result) setSelected(idx);
  };

  const handleSubmit = async () => {
    if (selected === null || submitting) return;
    setSubmitting(true);
    try {
      
      const payload = { id: data.id, guessIndex: selected };
      const { data: res } = await axios.post(API_GUESS, payload);

      setResult(res);                             
    } catch (err) {
      console.error(err);
      setResult({ correct: false, message: 'Server error — try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card variant="outlined" sx={{ p: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Guess the Lie
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Statements by: Aryan
          </Typography>
          <Typography variant="body2" gutterBottom>
            Select the statement you think is a lie.
          </Typography>

          {data.facts.map((fact, idx) => (
            <Box
              key={idx}
              onClick={() => handleSelect(idx)}
              sx={{
                p: 2,
                mb: 1,
                border: 1,
                borderColor: selected === idx ? 'primary.main' : 'grey.300',
                borderRadius: 1,
                cursor: result ? 'default' : 'pointer',
                bgcolor:
                  selected === idx ? 'action.selected' : 'background.paper',
                transition: 'background-color 0.2s',
                '&:hover': !result && { bgcolor: 'action.hover' }
              }}
            >
              <Typography variant="body1">{fact}</Typography>
            </Box>
          ))}

          <Button
            variant="contained"
            fullWidth
            disabled={selected === null || submitting || result}
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            {submitting ? 'Submitting…' : 'Submit Guess'}
          </Button>

          {result && (
            <Alert
              severity={result.correct ? 'success' : 'error'}
              sx={{ mt: 2 }}
            >
              {result.message}
              {!result.correct && result.correctAnswer !== undefined && (
                <Typography component="span" sx={{ ml: 1 }}>
                  (It was&nbsp;#{result.correctAnswer + 1})
                </Typography>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
