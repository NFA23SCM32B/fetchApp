

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Select,
  MenuItem,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import axios from "axios";
import "../styles/search.scss"; // <-- Import your SCSS
import { useNavigate } from "react-router-dom";

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

const Search = () => {
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreed, setSelectedBreed] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [favoriteDogs, setFavoriteDogs] = useState<string[]>([]);

  // ▼ NEW: Keep track of both "next" and "prev" queries
  const [nextQuery, setNextQuery] = useState<string | null>(null);
  const [prevQuery, setPrevQuery] = useState<string | null>(null);

  // 1) Fetch all available breeds on mount
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await axios.get(
          "https://frontend-take-home-service.fetch.com/dogs/breeds",
          { withCredentials: true }
        );
        setBreeds(response.data);
      } catch (error) {
        console.error("Error fetching breeds:", error);
      }
    };
    fetchBreeds();
  }, []);

  /**
   * 2) Fetch dogs from the API. 
   *    - If `query` is provided (like for next/prev), use it directly.
   *    - Otherwise, build a query from breed + sortOrder + size=6 (for 6 dogs/page).
   */
  const fetchDogs = async (
    query = `/dogs/search?breeds=${selectedBreed}&size=6&sort=breed:${sortOrder}`
  ) => {
    try {
      // (a) Get dog IDs from search endpoint
      const response = await axios.get(
        `https://frontend-take-home-service.fetch.com${query}`,
        { withCredentials: true }
      );
      // (b) Fetch the dog objects from those IDs
      const dogData = await axios.post(
        "https://frontend-take-home-service.fetch.com/dogs",
        response.data.resultIds,
        { withCredentials: true }
      );

      // Update dogs state
      setDogs(dogData.data);

      // Store next/prev queries for pagination
      setNextQuery(response.data.next || null);
      setPrevQuery(response.data.prev || null);
    } catch (error) {
      console.error("Error fetching dogs:", error);
    }
  };

  // 3) Refetch dogs whenever breed or sort changes
  //    (since we want fresh data from the server each time)
  useEffect(() => {
    fetchDogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBreed, sortOrder]);

  // Toggle a dog as favorite/unfavorite
  const handleFavorite = (id: string) => {
    setFavoriteDogs((prev) =>
      prev.includes(id) ? prev.filter((dogId) => dogId !== id) : [...prev, id]
    );
  };

  // POST /dogs/match with the favorited IDs
  const handleMatch = async () => {
    try {
      if (!favoriteDogs.length) {
        alert("No favorites selected!");
        return;
      }
      const response = await axios.post(
        "https://frontend-take-home-service.fetch.com/dogs/match",
        favoriteDogs,
        { withCredentials: true }
      );
      alert(`Your match is dog ID: ${response.data.match}`);
    } catch (error) {
      console.error("Error getting match:", error);
    }
  };

  // 4) Toggle ascending/descending for breed - local array sorting removed
  //    to rely on server-based sorting (the fetchDogs call includes sort=breed:xxx).
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const navigate = useNavigate();
  const handleLogout = async () => {
        try {
          await axios.post("https://frontend-take-home-service.fetch.com/auth/logout", {}, { withCredentials: true });
          navigate("/"); // or wherever your login page is
        } catch (error) {
          console.error("Logout failed:", error);
        }
      };
  return (
    <Box className="search-page">
      <Container className="search-container">
        <Typography variant="h4" className="search-header">
          Search for Dogs
        </Typography>

        {/* Filter + Sorting Toolbar */}
        <Box className="search-toolbar">
          {/* Breed Filter */}
          <FormControl className="breed-select">
            <InputLabel>Breed</InputLabel>
            <Select
              label="Breed"
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
            >
             
              {breeds.map((breed) => (
                <MenuItem key={breed} value={breed}>
                  {breed}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sort Toggle (ascending/descending) */}
          <Box className="sort-toggle">
            <IconButton color="primary" onClick={toggleSortOrder}>
              <SortIcon className="sort-icon" />
            </IconButton>
            <Typography variant="body1" component="span">
              Sort: Breed ({sortOrder.toUpperCase()})
            </Typography>
          </Box>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        </Box>

        {/* Dogs Grid - 6 per page from the server */}
        <Grid container spacing={3} className="dogs-grid">
          {dogs.map((dog) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={dog.id}
              className="dogs-innergrid"
            >
              <Card className="dog-card">
                <CardMedia
                  component="img"
                  height="200"
                  image={dog.img}
                  alt={dog.name}
                />
                <CardContent className="card-content">
                  <Typography variant="h6">Name: {dog.name}</Typography>
                  <Typography>Breed: {dog.breed}</Typography>
                  <Typography>Age: {dog.age}</Typography>
                  <Typography>Zip: {dog.zip_code}</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant={
                      favoriteDogs.includes(dog.id) ? "contained" : "outlined"
                    }
                    onClick={() => handleFavorite(dog.id)}
                    color="primary"
                  >
                    {favoriteDogs.includes(dog.id) ? "Unfavorite" : "Favorite"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Bottom Action Buttons */}
        <Box className="actions-buttons" mt={3} display="flex" justifyContent="space-between">
          {/* “Get My Match” */}
          <Button
            onClick={handleMatch}
            variant="contained"
            color="secondary"
            disabled={!favoriteDogs.length}
          >
            Get My Match
          </Button>

          {/* Pagination */}
          <Box>
            {/* Prev Button if prevQuery is available */}
            {prevQuery && (
              <Button
                variant="outlined"
                sx={{ mr: 2 }}
                onClick={() => fetchDogs(prevQuery)}
              >
                Prev
              </Button>
            )}
            {/* Next Button if nextQuery is available */}
            {nextQuery && (
              <Button variant="outlined" onClick={() => fetchDogs(nextQuery)}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Search;
