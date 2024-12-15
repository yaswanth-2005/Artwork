import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const ArtworksTable = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArtworks, setSelectedArtworks] = useState<Set<number>>(
    new Set()
  );
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showSelectionDialog, setShowSelectionDialog] = useState(false);
  const [rowsToSelect, setRowsToSelect] = useState<number>(0);

  useEffect(() => {
    loadArtworks();
  }, [page, rowsPerPage]);

  const loadArtworks = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${
          page + 1
        }&limit=${rowsPerPage}`
      );
      const data = await response.json();
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error("Error loading artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  const onPage = (event: { first: number; rows: number; page: number }) => {
    setPage(event.page);
    setRowsPerPage(event.rows); // Update rowsPerPage when page changes
  };

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const newSelection = new Set(selectedArtworks);
    e.value.forEach((artwork) => {
      newSelection.add(artwork.id);
    });
    setSelectedArtworks(newSelection);
  };

  const isSelected = (artwork: Artwork) => {
    return selectedArtworks.has(artwork.id);
  };

  const handleBulkSelection = () => {
    const newSelection = new Set(selectedArtworks);
    const artworksToSelect = artworks.slice(0, rowsToSelect); // Only select up to the entered number
    artworksToSelect.forEach((artwork) => {
      newSelection.add(artwork.id);
    });
    setSelectedArtworks(newSelection);
    setShowSelectionDialog(false);
  };

  const selectionColumnTemplate = (rowData: Artwork) => {
    return (
      <div className="flex align-items-center">
        <Checkbox
          checked={isSelected(rowData)}
          onChange={() => {
            const newSelection = new Set(selectedArtworks);
            if (newSelection.has(rowData.id)) {
              newSelection.delete(rowData.id);
            } else {
              newSelection.add(rowData.id);
            }
            setSelectedArtworks(newSelection);
          }}
        />
      </div>
    );
  };

  const selectionHeaderTemplate = () => {
    return (
      <div className="flex align-items-center">
        <Checkbox
          checked={
            artworks.length > 0 &&
            artworks.every((artwork) => isSelected(artwork))
          }
          onChange={(e) => {
            const newSelection = new Set(selectedArtworks);
            if (e.checked) {
              artworks.forEach((artwork) => newSelection.add(artwork.id));
            } else {
              artworks.forEach((artwork) => newSelection.delete(artwork.id));
            }
            setSelectedArtworks(newSelection);
          }}
        />
        <Button
          icon="pi pi-chevron-down"
          className="p-button-text p-button-rounded"
          onClick={() => setShowSelectionDialog(true)}
        />
      </div>
    );
  };

  const renderSelectionDialog = () => {
    return (
      <Dialog
        header="Select Multiple Rows"
        visible={showSelectionDialog}
        onHide={() => setShowSelectionDialog(false)}
        style={{ width: "400px" }}
      >
        <div className="flex flex-column gap-2">
          <div className="flex align-items-center gap-2">
            <label htmlFor="rowsToSelect">Number of rows to select:</label>
            <InputNumber
              id="rowsToSelect"
              value={rowsToSelect}
              onValueChange={(e) => setRowsToSelect(e.value || 0)}
              min={0}
              max={artworks.length}
            />
          </div>
          <Button label="Submit" onClick={handleBulkSelection} />
        </div>
      </Dialog>
    );
  };

  return (
    <div className="card">
      <h2>Artworks Table</h2>
      <DataTable
        value={artworks}
        lazy
        paginator
        first={page * rowsPerPage}
        rows={rowsPerPage}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        dataKey="id"
        selectionMode="multiple"
        selection={artworks.filter((artwork) => isSelected(artwork))}
        onSelectionChange={onSelectionChange}
      >
        <Column
          headerStyle={{ width: "3rem" }}
          body={selectionColumnTemplate}
          header={selectionHeaderTemplate}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
      {renderSelectionDialog()}
    </div>
  );
};

export default ArtworksTable;
