const userData = require("./user.json");
const bookingData = require("./booking.json");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const filterDateTime = (
  users,
  startDate = new Date(),
  endDate = new Date()
) => {
  const result = [];
  for (const user of users) {
    if (
      new Date(user.created_at).getTime() >= startDate.getTime() &&
      new Date(user.created_at).getTime() <= endDate.getTime()
    )
      result.push(user);
  }
  return result;
};

const writeCSV = (header, data, filename) => {
  const csvWriter = createCsvWriter({
    path: `./${filename}.csv`,
    header,
  });
  csvWriter.writeRecords(data).then(() => console.log("...Done."));
};

const getUserInGroup = (bookings, users) => {
  const userInGroupInformation = [];
  const allUserID = [];

  for (const user of users) {
    const {
      id,
      username,
      firstname,
      lastname,
      firstname_th,
      lastname_th,
      prefix,
      gender,
      created_at,
    } = user;

    for (const booking of bookings) {
      const groupInformationRequest = JSON.parse(
        booking.group_information_request
      );

      for (const userInGroup of groupInformationRequest) {
        const {
          PREFIX,
          GENDER,
          FIRSTNAME,
          LASTNAME,
          FIRSTNAME_TH,
          LASTNAME_TH,
        } = userInGroup;

        const condition =
          prefix === PREFIX &&
          gender === GENDER &&
          firstname === FIRSTNAME &&
          lastname === LASTNAME &&
          firstname_th === FIRSTNAME_TH &&
          lastname_th === LASTNAME_TH;

        if (condition && !allUserID.includes(id)) {
          allUserID.push(id);
          userInGroupInformation.push({
            id,
            username,
            firstname,
            lastname,
            firstname_th,
            lastname_th,
            prefix,
            gender,
            created_at,
          });
        }
      }
    }
  }
  return { userInGroup: userInGroupInformation, allUserID };
};

const validateUser = () => {
  const users = userData.up_users.filter((user) => user.prefix !== "Mr.");
  const bookings = bookingData.bookings;
  console.log("user => ", users.length);
  console.log("booking => ", bookings.length);

  const filteredDateTimeUsers = filterDateTime(
    users,
    new Date("2024-05-24T11:00:00.000Z"),
    new Date("2025-06-26T11:30:00.000Z")
  );

  console.log("user in time => ", filteredDateTimeUsers.length);

  const { userInGroup, allUserID } = getUserInGroup(
    bookings,
    filteredDateTimeUsers
  );

  const userWithoutGroup = filteredDateTimeUsers
    .map((user) => {
      if (!allUserID.includes(user.id)) {
        const newPrefix = user.prefix === "Mrs." ? "Ms." : "Mrs.";
        return { ...user, newPrefix, status: "NONE" };
      }
      return null;
    })
    .filter(Boolean);

  console.log("userInGroup => ", userInGroup.length);
  console.log("userWithoutGruop => ", userWithoutGroup.length);

  // Write user in group
  writeCSV(
    [
      { id: "id", title: "ID" },
      { id: "username", title: "Username" },
      { id: "firstname", title: "Firstname" },
      { id: "lastname", title: "Lastname" },
      { id: "firstname_th", title: "Firstname TH" },
      { id: "lastname_th", title: "Lastname TH" },
      { id: "created_at", title: "Created At" },
      { id: "prefix", title: "Prefix" },
    ],
    userInGroup,
    "userInGroup"
  );

  // Write user without group
  writeCSV(
    [
      { id: "id", title: "ID" },
      { id: "username", title: "Username" },
      { id: "firstname", title: "Firstname" },
      { id: "lastname", title: "Lastname" },
      { id: "firstname_th", title: "Firstname TH" },
      { id: "lastname_th", title: "Lastname TH" },
      { id: "created_at", title: "Created At" },
      { id: "prefix", title: "Old Prefix" },
      { id: "newPrefix", title: "New Prefix" },
      { id: "status", title: "Status" },
    ],
    userWithoutGroup,
    "userWithoutGroup"
  );
};

validateUser();
