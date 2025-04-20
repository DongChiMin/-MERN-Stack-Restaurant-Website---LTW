import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { TextField, Tabs, Button } from "@mui/material";

import axios from "axios";
import { Modal } from "bootstrap";

function AreasAndTables({ tables, reservations, onTableUpdated }) {
  //Các state
  const [value, setValue] = useState("1");
  const [areas, setAreas] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [editedTable, setEditedTable] = useState(null); // 👈 State để lưu thông tin chỉnh sửa

  useEffect(() => {
    const uniqueAreas = [
      ...new Set(tables.map((table) => table.seatingArea.trim())),
    ];
    const sortedAreas = uniqueAreas.sort((a, b) => a.localeCompare(b));
    setAreas(sortedAreas);
  }, [tables]);

  // Khi chọn bàn, copy dữ liệu vào editedTable
  const handleDetailClick = (table) => {
    const modal = new Modal(document.getElementById("tableDetailModal"));
    modal.show();

    const bookingHistoryArray = table.bookingHistory;
    // console.log(bookingHistoryArray);

    setSelectedTable(table);
    setEditedTable({ ...table }); // Tạo bản sao để chỉnh sửa
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getTablesByArea = (area) => {
    return tables.filter((table) => table.seatingArea.trim() === area);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTable((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (e) => {
    e.preventDefault();

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa bàn này?");
    if (!isConfirmed) return;

    try {
      const response = await axios.delete(
        `http://localhost:3001/api/tables/delete/${editedTable._id}`
      );
      console.log("✅ Deleted successfully:", response.data);

      // Gọi callback để fetch lại dữ liệu
      if (onTableUpdated) {
        onTableUpdated();
      }

      // Tắt modal
      Modal.getInstance(document.getElementById("tableDetailModal"))?.hide();
      document.activeElement.blur();
    } catch (error) {
      console.error("❌ Error deleting table:", error);
    }
  };

  //Sửa lại thông tin của bàn
  const handleSubmit = (e) => {
    e.preventDefault();

    // Chỉ lấy note và capacity để gửi
    const updatedData = {
      note: editedTable.note,
      capacity: editedTable.capacity,
    };

    console.log("Updated table data:", updatedData);

    // Gửi yêu cầu PUT hoặc POST đến server với axios
    axios
      .put(
        `http://localhost:3001/api/tables/update/${editedTable._id}`,
        updatedData
      )
      .then((response) => {
        console.log("Data successfully updated:", response.data);
        // Bạn có thể thêm hành động sau khi gửi thành công (ví dụ: thông báo, cập nhật lại UI, v.v.)
        alert("Update table information successful!");
      })
      .catch((error) => {
        alert("Update table information Failed!");
        // Xử lý lỗi (ví dụ: hiển thị thông báo lỗi)
      });
  };

  return (
    <>
      {/* Modal hiển thị và chỉnh sửa chi tiết table */}
      <div className="modal fade" id="tableDetailModal">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" style={{ fontSize: "30px" }}>
                Booking history & Edit Table {selectedTable?.tableNumber}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {editedTable ? (
                <div className="row">
                  <div className="col-xl-8">
                    {selectedTable.bookingHistory?.length > 0 ? (
                      <>
                        <p>
                          The entries with{" "}
                          <span style={{ color: "red", fontWeight: "bold" }}>
                            red background
                          </span>{" "}
                          indicate bookings that are scheduled for today.
                        </p>
                        <div
                          className="table-responsive"
                          style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            border: "1px solid #dee2e6",
                            borderRadius: "4px",
                          }}
                        >
                          <table className="table table-striped mb-0">
                            <thead
                              style={{
                                position: "sticky",
                                top: 0,
                                backgroundColor: "white",
                                zIndex: 1,
                              }}
                            >
                              <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Reservation ID</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedTable.bookingHistory
                                .sort(
                                  (a, b) =>
                                    new Date(b.startTime) -
                                    new Date(a.startTime)
                                )
                                .map((booking) => {
                                  const bookingDate = new Date(
                                    booking.startTime
                                  ).toLocaleDateString();
                                  const today = new Date().toLocaleDateString();
                                  const isToday = bookingDate === today;

                                  return (
                                    <tr key={booking._id}>
                                      <td
                                        style={
                                          isToday
                                            ? { backgroundColor: "#ffdddd" }
                                            : {}
                                        }
                                      >
                                        {new Date(
                                          booking.startTime
                                        ).toLocaleDateString()}
                                      </td>
                                      <td
                                        style={
                                          isToday
                                            ? { backgroundColor: "#ffdddd" }
                                            : {}
                                        }
                                      >
                                        {new Date(
                                          booking.startTime
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}{" "}
                                        -{" "}
                                        {new Date(
                                          booking.endTime
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </td>
                                      <td
                                        style={
                                          isToday
                                            ? { backgroundColor: "#ffdddd" }
                                            : {}
                                        }
                                      >
                                        {booking.reservationId.toString()}...
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <p className="text-muted">No booking history</p>
                    )}
                    <button
                      type="button"
                      className="btn-select mt-3"
                      data-bs-dismiss="modal"
                    >
                      Close
                    </button>
                  </div>
                  <div className="col-xl-4">
                    <form onSubmit={handleSubmit}>
                      <table className="table table-bordered">
                        <tbody>
                          <tr>
                            <th>Area</th>
                            <td>
                              <input
                                type="text"
                                name="seatingArea"
                                value={editedTable.seatingArea}
                                onChange={handleInputChange}
                                className="form-control"
                                disabled
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>Table type</th>
                            <td>
                              <input
                                type="text"
                                name="tableType"
                                value={editedTable.tableType}
                                onChange={handleInputChange}
                                className="form-control"
                                disabled
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>Capacity</th>
                            <td>
                              <input
                                type="number"
                                name="capacity"
                                value={editedTable.capacity}
                                onChange={handleInputChange}
                                className="form-control"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>Note</th>
                            <td>
                              <textarea
                                name="note"
                                value={editedTable.note}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="Currently no note"
                              />
                            </td>
                          </tr>
                          <tr>
                            <th>Date created</th>
                            <td>
                              <input
                                type="datetime-local"
                                name="createdAt"
                                value={new Date(editedTable.createdAt)
                                  .toISOString()
                                  .slice(0, 16)}
                                onChange={handleInputChange}
                                className="form-control"
                                disabled
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <div className="d-flex justify-content-between">
                        <button
                          type="button"
                          className="btn-select"
                          onClick={handleDelete}
                        >
                          Delete
                        </button>
                        {/* //Nút bấm để gửi api cập nhật lại thông tin bàn: hiện tại không nên cho sửa nhiều thông tin bàn vì thông tin đặt bàn sẽ bị sai  */}
                        <button type="submit" className="btn-select selected">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Giao diện chính (giữ nguyên) */}
      <Box sx={{ width: "100%", typography: "body1" }}>
        <TabContext value={value}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="scrollable auto tabs example"
              style={{ width: "600px" }}
            >
              {areas.map((area, index) => (
                <Tab key={area} label={area} value={(index + 1).toString()} />
              ))}
            </Tabs>
            <p
              style={{
                fontFamily: "josefinSans",
                fontSize: "16px",
                marginBottom: "0px",
              }}
            >
              <span style={{ backgroundColor: "#FFDDDD", padding: "2px 6px" }}>
                Red background
              </span>{" "}
              bookings scheduled <strong>today</strong>.
              <br />
              <span style={{ backgroundColor: "#DDFFDD", padding: "2px 6px" }}>
                Green background
              </span>{" "}
              bookings scheduled <strong>future</strong>.
            </p>

            {/* //Bộ lọc theo ngày */}
            {/* <TextField
              id="date"
              label="Choose date"
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            /> */}
          </Box>

          {areas.map((area, index) => (
            <TabPanel key={area} value={(index + 1).toString()}>
              <div className="row">
                {getTablesByArea(area).map((table) => {
                  const today = new Date();
                  const todayStr = today.toLocaleDateString();

                  const hasBookingToday = table.bookingHistory.some(
                    (booking) => {
                      const bookingDate = new Date(
                        booking.startTime
                      ).toLocaleDateString();
                      return bookingDate === todayStr;
                    }
                  );

                  const hasFutureBooking = table.bookingHistory.some(
                    (booking) => {
                      const bookingDate = new Date(booking.startTime);
                      // So sánh ngày (không tính giờ)
                      return (
                        bookingDate.setHours(0, 0, 0, 0) >
                        today.setHours(0, 0, 0, 0)
                      );
                    }
                  );

                  let bgColor = "white";
                  if (hasBookingToday) {
                    bgColor = "#FFDDDD";
                  } else if (hasFutureBooking) {
                    bgColor = "#DDFFDD";
                  }

                  return (
                    <div key={table._id} className="col-4 mb-3">
                      <div
                        className="card h-100"
                        style={{ backgroundColor: bgColor }}
                      >
                        <div className="card-body">
                          <h5
                            className="card-title"
                            style={{ fontSize: "30px" }}
                          >
                            Table {table.tableNumber}
                          </h5>
                          <p
                            className="card-text"
                            style={{ fontFamily: "josefinSans" }}
                          >
                            Type: {table.tableType}
                            <br />
                            Capacity: {table.capacity}
                            <br />
                            Note: {table.note}
                          </p>
                          <button onClick={() => handleDetailClick(table)}>
                            Edit Table
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabPanel>
          ))}
        </TabContext>
      </Box>
    </>
  );
}

export default AreasAndTables;
