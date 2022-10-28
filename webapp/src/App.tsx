import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'

function App() {
  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton>
            <MenuIcon/>
          </IconButton>
          <Typography>
            Initial App
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default App;
