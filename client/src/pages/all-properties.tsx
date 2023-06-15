import { Add } from "@mui/icons-material";
import { useTable } from "@pankod/refine-core";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Select,
  MenuItem,
} from "@pankod/refine-mui";
import { useNavigate } from "@pankod/refine-react-router-v6";
import { useMemo } from "react";

import { PropertyCard, CustomButton } from "components";

const AllProperties = () => {

  const navigate = useNavigate();

  const { // Este hook recibe data desde el server y establece estados para los filtros del mismo.
    tableQueryResult: { data, isLoading, isError },  
    current,      // página actual
    setCurrent,   // establece la página actual
    setPageSize,  // nº de elementos a mostrar por página
    pageCount,    // contador de elementos que se muestran por página
    sorter,       // tipo de ordenamiento de los elementos ( asc o desc )
    setSorter,    // establece el tipo de ordenamiento
    filters,      // filtros personalizados
    setFilters,   // establece los filtros personalizados
  } = useTable();   // Cuando se carga localhost:3000/properties se carga como resource "properties" y se hace la peticion get a /api/v1/properties

  console.log(data) // La data que se recibe del useTable viene de getAllProperties en property.controller.js en el server.

  const allProperties = data?.data ?? [];

  const currentPrice = sorter.find((item) => item.field === "price")?.order; // currentPrice contendrá el valor de order contenido dentro de  
                                                                             // [{ field, order }]. Al iniciarse su valor por defecto es desc.
  
  //Estado para sort
  const toggleSort = (field: string) => {                                    // Recibe un field = asc o desc
    setSorter([{ field, order: currentPrice === "asc" ? "desc" : "asc" }]);  // Estado para sorter [{ price, order: desc o asc }]
  };                                                                         // Click -> field=price -> order = contrario de currentPrice

  //Contruimos un [] con los filtros a aplicar -> value al item a mostrar
  const currentFilterValues = useMemo(() => {
    const logicalFilters = filters.flatMap((item) => // Se construye un nuevo array aplanado que contenga el campo "field" en cada item iterado
      "field" in item ? item : [],
    );

    return {
      title:
        logicalFilters.find((item) => item.field === "title")?.value || // title = value del item de [logicalFilters] cuyo item.field == "title"
        "",
      propertyType:
        logicalFilters.find((item) => item.field === "propertyType")    // propertyType = value del item de [logicalFilters] cuyo item.field == "propertyType"
          ?.value || "",
    };
  },[filters]); 



  if( isLoading ) return <Typography>Loading...</Typography>
  if( isError ) return <Typography>Error :(</Typography>


  return (
    <Box>

      {/* Filtros */}
      <Box mt="20px" sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        <Stack direction="column" width="100%">
          <Typography
            fontSize={25}
            fontWeight={700}
            color="#11142d"
          >
            { !allProperties.length ? 'There are no properties' : 'All Properties' }
          </Typography>
          <Box
            mb={2}
            mt={3}
            display="flex"
            width="84%"
            justifyContent="space-between"
            flexWrap="wrap"
          >
            <Box
              display="flex"
              gap={2}
              flexWrap="wrap"
              mb={{ xs: "20px", sm: 0 }}
            >
              <CustomButton
                title={`Sort price ${currentPrice === "asc" ? "↑" : "↓"
                  }`}
                handleClick={() => toggleSort("price")}
                backgroundColor="#475be8"
                color="#fcfcfc"
              />
              <TextField
                variant="outlined"
                color="info"
                placeholder="Search by title"
                value={ currentFilterValues.title }
                onChange={(e) => {
                  setFilters([  // Estado para Filters
                    {
                      field: "title",
                      operator: "contains",
                      value: e.currentTarget.value
                        ? e.currentTarget.value
                        : undefined,
                    },
                  ]);
                }}
              />
              <Select
                variant="outlined"
                color="info"
                displayEmpty
                required
                inputProps={{ "aria-label": "Without label" }}
                defaultValue=""
                value={ currentFilterValues.propertyType }
                onChange={(e) => {
                  setFilters( // Estado para Filters
                    [
                      {
                        field: "propertyType",
                        operator: "eq",
                        value: e.target.value,
                      },
                    ],
                    "replace",
                  );
                }}
              >
                <MenuItem value="">All</MenuItem>
                {[
                  "Apartment",
                  "Villa",
                  "Farmhouse",
                  "Condos",
                  "Townhouse",
                  "Duplex",
                  "Studio",
                  "Chalet",
                ].map((type) => (
                  <MenuItem
                    key={type}
                    value={type.toLowerCase()}
                  >
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Boton de crear propiedad */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <CustomButton 
          title="Create Property" 
          handleClick={() => navigate('/properties/create')}
          backgroundColor="#475be8"
          color="#fcfcfc"
          icon={<Add />}
        />
      </Stack>

      {/* Listado de propiedades */}
      <Box
        mt="20px"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}
      >
        { allProperties.map(( property ) => (
          <PropertyCard 
            key={ property._id }
            id={ property._id }
            title={ property.title }
            price={ property.price }
            location={ property.location }
            photo={ property.photo}
          />  
        ))}
      </Box>

      {/* Pagination */}
      { allProperties.length > 0 && (
        <Box display="flex" gap={2} mt={3} flexWrap="wrap">
          <CustomButton
            title="Previous"
            handleClick={() => setCurrent((prev) => prev - 1)}
            backgroundColor="#475be8"
            color="#fcfcfc"
            disabled={!(current > 1)} // 1ª página
          />
          <Box
            display={{ xs: "hidden", sm: "flex" }}
            alignItems="center"
            gap="5px"
          >
            Page{" "}
            <strong>
              { current } of { pageCount }
            </strong>
          </Box>
          <CustomButton
            title="Next"
            handleClick={() => setCurrent((prev) => prev + 1)}
            backgroundColor="#475be8"
            color="#fcfcfc"
            disabled={current === pageCount} // Última página
          />
          <Select
            variant="outlined"
            color="info"
            displayEmpty
            required
            inputProps={{ "aria-label": "Without label" }}
            defaultValue={10}
            onChange={(e) =>
              setPageSize(
                e.target.value ? Number(e.target.value) : 10,
              )
            }
          >
            {[10, 20, 30, 40, 50].map((size) => (
              <MenuItem key={size} value={size}>
                Show {size}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}
    </Box>
  )
}

export default AllProperties