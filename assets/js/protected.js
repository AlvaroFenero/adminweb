document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../index.html'; // Redirige al login si no hay token
    }
    
    fetch('http://localhost:5000/api/protected', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.status !== 200) {
            throw new Error('Token inválido o ha expirado');
        }
        return response.json();
    })
    .then(data => {
        console.log('Acceso permitido:', data);
        // Aquí puedes agregar lógica adicional para manejar los datos del usuario
    })
    .catch(error => {
        console.error('Error:', error);
        localStorage.removeItem('token');
        window.location.href = '../index.html';
    });
});
