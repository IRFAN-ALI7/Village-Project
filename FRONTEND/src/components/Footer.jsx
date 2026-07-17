import Box from '@mui/material/Box';

export default function Footer() {
  return (
    <Box component="section" sx={{ 
        p:2,
        width: "100%", 
        border: '1px dashed grey',
        textAlign: "center",
        margin: "5px",
        backgroundColor: "#adcdd2",
        }}>
      @ 2026 Gram Panchayat
    </Box>
  );
}
