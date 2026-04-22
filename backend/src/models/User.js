// In-memory array to store users
let users = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" }
];

class User {
    static getAll() {
        return users;
    }

    static create(userData) {
        const newUser = { id: users.length + 1, ...userData };
        users.push(newUser);
        return newUser;
    }

    static update(id, updatedData) {
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedData };
            return users[index];
        }
        return null;
    }

    static delete(id) {
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index !== -1) {
            return users.splice(index, 1)[0];
        }
        return null;
    }
}

module.exports = User;
