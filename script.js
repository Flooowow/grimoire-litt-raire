// ========================================
// GRIMOIRE LITTÉRAIRE - SYSTÈME DE STOCKAGE COMPRESSÉ
// ========================================

const DB_NAME = 'grimoireLitteraire';
const DB_VERSION = 1;
const STORE_NAME = 'livres';

let db = null;
let currentBookData = null;
let currentShelfLevel = null;
let editMode = false;

// ========================================
// INITIALISATION DE LA BASE DE DONNÉES
// ========================================

function initDB() {
    return new Promise((resolve, reject) => {
        console.log('🔧 Initialisation de la base de données...');
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('❌ Erreur d\'ouverture de la DB:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('✅ Base de données ouverte avec succès!');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            console.log('⚡ Mise à jour de la structure de la DB...');
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                console.log('📦 Store créé:', STORE_NAME);
            }
        };
    });
}

// ========================================
// COMPRESSION ET DÉCOMPRESSION
// ========================================

function compressData(data) {
    const jsonString = JSON.stringify(data);
    const compressed = LZString.compressToUTF16(jsonString);
    return compressed;
}

function decompressData(compressed) {
    const jsonString = LZString.decompressFromUTF16(compressed);
    return jsonString ? JSON.parse(jsonString) : null;
}

// Bibliothèque LZString intégrée
var LZString=function(){var r=String.fromCharCode,o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",e={};function c(r,o){if(!e[r]){e[r]={};for(var n=0;n<r.length;n++)e[r][r.charAt(n)]=n}return e[r][o]}var t={compressToBase64:function(r){if(null==r)return"";var n=t._compress(r,6,function(r){return o.charAt(r)});switch(n.length%4){default:case 0:return n;case 1:return n+"===";case 2:return n+"==";case 3:return n+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:t._decompress(r.length,32,function(n){return c(o,r.charAt(n))})},compressToUTF16:function(o){return null==o?"":t._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(r){return null==r?"":""==r?null:t._decompress(r.length,16384,function(o){return r.charCodeAt(o)-32})},compressToUint8Array:function(r){for(var o=t.compress(r),n=new Uint8Array(2*o.length),e=0,c=o.length;e<c;e++){var a=o.charCodeAt(e);n[2*e]=a>>>8,n[2*e+1]=a%256}return n},decompressFromUint8Array:function(o){if(null==o)return t.decompress(o);for(var n=new Array(o.length/2),e=0,c=n.length;e<c;e++)n[e]=256*o[2*e]+o[2*e+1];var a=[];return n.forEach(function(o){a.push(r(o))}),t.decompress(a.join(""))},compressToEncodedURIComponent:function(r){return null==r?"":t._compress(r,6,function(r){return n.charAt(r)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),t._decompress(r.length,32,function(o){return c(n,r.charAt(o))}))},compress:function(o){return t._compress(o,16,function(o){return r(o)})},_compress:function(r,o,n){if(null==r)return"";var e,c,t,a={},u={},i="",s="",p="",l=2,f=3,h=2,d=[],m=0,v=0;for(t=0;t<r.length;t+=1)if(i=r.charAt(t),Object.prototype.hasOwnProperty.call(a,i)||(a[i]=f++,u[i]=!0),s=p+i,Object.prototype.hasOwnProperty.call(a,s))p=s;else{if(Object.prototype.hasOwnProperty.call(u,p)){if(p.charCodeAt(0)<256){for(e=0;e<h;e++)m<<=1,v==o-1?(v=0,d.push(n(m)),m=0):v++;for(c=p.charCodeAt(0),e=0;e<8;e++)m=m<<1|1&c,v==o-1?(v=0,d.push(n(m)),m=0):v++,c>>=1}else{for(c=1,e=0;e<h;e++)m=m<<1|c,v==o-1?(v=0,d.push(n(m)),m=0):v++,c=0;for(c=p.charCodeAt(0),e=0;e<16;e++)m=m<<1|1&c,v==o-1?(v=0,d.push(n(m)),m=0):v++,c>>=1}0==--l&&(l=Math.pow(2,h),h++),delete u[p]}else for(c=a[p],e=0;e<h;e++)m=m<<1|1&c,v==o-1?(v=0,d.push(n(m)),m=0):v++,c>>=1;0==--l&&(l=Math.pow(2,h),h++),a[s]=f++,p=String(i)}if(""!==p){if(Object.prototype.hasOwnProperty.call(u,p)){if(p.charCodeAt(0)<256){for(e=0;e<h;e++)m<<=1,v==o-1?(v=0,d.push(n(m)),m=0):v++;for(c=p.charCodeAt(0),e=0;e<8;e++)m=m<<1|1&c,v==o-1?(v=0,d.push(n(m)),m=0):v++,c>>=1}else{for(c=1,e=0;e<h;e++)m=m<<1|c,v==o-1?(v=0,d.push(n(m)),m=0):v++,c=0;for(c=p.charCodeAt(0),e=0;e<16;e++)m=m<<1|1&c,v==o-1?(v=0,d.push(n(m)),m=0):v++,c>>=1}0==--l&&(l=Math.pow(2,h),h++),delete u[p]}else for(c=a[p],e=0;e<h;e++)m=m<<1|1&c,v==o-1?(v=0,d.push(n(m)),m=0):v++,c>>=1;0==--l&&(l=Math.pow(2,h),h++)}for(c=2,e=0;e<h;e++)m=m<<1|1&c,v==o-1?(v=0,d.push(n(m)),m=0):v++,c>>=1;for(;;){if(m<<=1,v==o-1){d.push(n(m));break}v++}return d.join("")},decompress:function(r){return null==r?"":""==r?null:t._decompress(r.length,32768,function(o){return r.charCodeAt(o)})},_decompress:function(o,n,e){var c,t,a,u,i,s,p,l=[],f=4,h=4,d=3,m="",v=[],g={val:e(0),position:n,index:1};for(c=0;c<3;c+=1)l[c]=c;for(a=0,i=Math.pow(2,2),s=1;s!=i;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),a|=(u>0?1:0)*s,s<<=1;switch(a){case 0:for(a=0,i=Math.pow(2,8),s=1;s!=i;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),a|=(u>0?1:0)*s,s<<=1;p=r(a);break;case 1:for(a=0,i=Math.pow(2,16),s=1;s!=i;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),a|=(u>0?1:0)*s,s<<=1;p=r(a);break;case 2:return""}for(l[3]=p,t=p,v.push(p);;){if(g.index>o)return"";for(a=0,i=Math.pow(2,d),s=1;s!=i;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),a|=(u>0?1:0)*s,s<<=1;switch(p=a){case 0:for(a=0,i=Math.pow(2,8),s=1;s!=i;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),a|=(u>0?1:0)*s,s<<=1;l[h++]=r(a),p=h-1,f--;break;case 1:for(a=0,i=Math.pow(2,16),s=1;s!=i;)u=g.val&g.position,g.position>>=1,0==g.position&&(g.position=n,g.val=e(g.index++)),a|=(u>0?1:0)*s,s<<=1;l[h++]=r(a),p=h-1,f--;break;case 2:return v.join("")}if(0==f&&(f=Math.pow(2,d),d++),l[p])m=l[p];else{if(p!==h)return null;m=t+t.charAt(0)}v.push(m),l[h++]=t+m.charAt(0),t=m,0==--f&&(f=Math.pow(2,d),d++)}}};return t}();

// ========================================
// OPÉRATIONS BASE DE DONNÉES
// ========================================

async function saveBook(bookData) {
    try {
        // Vérification des données
        if (!bookData.title || !bookData.content || !bookData.style || !bookData.color || !bookData.level) {
            throw new Error('Données incomplètes: ' + JSON.stringify(bookData));
        }

        // On compresse UNIQUEMENT le contenu texte
        const compressedContent = compressData({ content: bookData.content });
        
        // Test de décompression pour vérifier l'intégrité
        const testDecompress = decompressData(compressedContent);
        if (!testDecompress || !testDecompress.content) {
            throw new Error('Erreur de compression/décompression');
        }
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // Construction de l'objet à sauvegarder
            const bookToSave = {
                title: bookData.title,
                style: bookData.style,
                color: bookData.color,
                level: bookData.level,
                compressedContent: compressedContent
            };

            // On ajoute l'id SEULEMENT s'il existe (pour les updates)
            if (bookData.id) {
                bookToSave.id = bookData.id;
            }

            // Pour un nouveau livre (pas d'id), on utilise add
            // Pour une mise à jour (avec id), on utilise put
            const request = bookData.id 
                ? store.put(bookToSave)
                : store.add(bookToSave);

            request.onsuccess = () => {
                console.log('✅ Livre sauvegardé avec succès! ID:', request.result);
                resolve(request.result);
            };
            request.onerror = () => {
                console.error('❌ Erreur de sauvegarde IndexedDB:', request.error);
                reject(request.error);
            };
        });
    } catch (error) {
        console.error('❌ Erreur dans saveBook:', error);
        throw error;
    }
}

async function getAllBooks() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            console.log('📚 Livres récupérés:', request.result.length);
            const books = request.result.map(book => {
                // Décompression du contenu uniquement
                const decompressedData = decompressData(book.compressedContent);
                return {
                    id: book.id,
                    title: book.title,
                    style: book.style,
                    color: book.color,
                    level: book.level,
                    content: decompressedData ? decompressedData.content : ''
                };
            });
            resolve(books);
        };
        request.onerror = () => {
            console.error('❌ Erreur getAllBooks:', request.error);
            reject(request.error);
        };
    });
}

async function deleteBook(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ========================================
// RENDU DES LIVRES
// ========================================

async function renderBooks() {
    const books = await getAllBooks();
    
    // Clear all shelves
    document.querySelectorAll('.books-container').forEach(container => {
        container.innerHTML = '';
    });

    // Render books on their respective shelves
    books.forEach(book => {
        const shelf = document.querySelector(`.shelf[data-level="${book.level}"] .books-container`);
        if (shelf) {
            const bookElement = createBookElement(book);
            shelf.appendChild(bookElement);
        }
    });
}

function createBookElement(book) {
    const bookDiv = document.createElement('div');
    bookDiv.className = 'book';
    bookDiv.innerHTML = `
        <div class="book-spine ${book.style}" style="background: ${book.color};">
            <div class="book-title">${book.title}</div>
        </div>
    `;

    bookDiv.addEventListener('click', () => openBookCard(book));
    return bookDiv;
}

// ========================================
// GESTION DES MODALS
// ========================================

function openAddBookModal(level) {
    currentShelfLevel = level;
    currentBookData = null;

    document.getElementById('modalTitle').textContent = 'Ajouter un livre';
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookContent').value = '';
    
    // Reset selections
    document.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
    
    // Select defaults - Peach Blossom par défaut
    document.querySelector('.style-option[data-style="fleurs-dorees"]').classList.add('selected');
    document.querySelector('.color-btn[data-color="#B88588"]').classList.add('selected');

    document.getElementById('bookModal').classList.add('active');
}

function closeBookModal() {
    document.getElementById('bookModal').classList.remove('active');
}

function openBookCard(book) {
    currentBookData = book;
    editMode = false;

    document.getElementById('cardTitle').textContent = book.title;
    document.getElementById('cardContent').textContent = book.content;
    document.getElementById('cardContent').style.display = 'block';
    document.getElementById('cardContentEdit').style.display = 'none';
    
    document.getElementById('modifyBtn').style.display = 'inline-block';
    document.getElementById('aspectBtn').style.display = 'inline-block';
    document.getElementById('deleteBtn').style.display = 'inline-block';
    document.querySelector('.edit-actions').style.display = 'none';

    document.getElementById('cardModal').classList.add('active');
}

function closeCardModal() {
    document.getElementById('cardModal').classList.remove('active');
    editMode = false;
}

// ========================================
// SAUVEGARDE DU LIVRE
// ========================================

async function saveBookFromModal() {
    const title = document.getElementById('bookTitle').value.trim();
    const content = document.getElementById('bookContent').value.trim();
    const selectedStyle = document.querySelector('.style-option.selected');
    const selectedColor = document.querySelector('.color-btn.selected');

    if (!title || !content) {
        alert('⚠️ Veuillez remplir le titre et le contenu du livre.');
        return;
    }

    if (!selectedStyle || !selectedColor) {
        alert('⚠️ Veuillez sélectionner un style et une couleur.');
        return;
    }

    const bookData = {
        title,
        content,
        style: selectedStyle.dataset.style,
        color: selectedColor.dataset.color,
        level: currentBookData ? currentBookData.level : currentShelfLevel
    };

    // On ajoute l'id seulement si on édite un livre existant
    if (currentBookData && currentBookData.id) {
        bookData.id = currentBookData.id;
        console.log('📝 Mise à jour du livre:', bookData.id, bookData.title);
    } else {
        console.log('✨ Création d\'un nouveau livre:', bookData.title, 'sur étagère:', bookData.level);
    }

    try {
        const resultId = await saveBook(bookData);
        console.log('💾 Livre sauvegardé avec ID:', resultId);
        await renderBooks();
        closeBookModal();
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        alert('❌ Erreur lors de la sauvegarde du livre: ' + error.message);
    }
}

// ========================================
// ÉDITION DE LA FICHE
// ========================================

function enterEditMode() {
    editMode = true;
    
    const content = document.getElementById('cardContent').textContent;
    document.getElementById('cardContentEdit').value = content;
    
    document.getElementById('cardContent').style.display = 'none';
    document.getElementById('cardContentEdit').style.display = 'block';
    
    document.getElementById('modifyBtn').style.display = 'none';
    document.getElementById('aspectBtn').style.display = 'none';
    document.getElementById('deleteBtn').style.display = 'none';
    document.querySelector('.edit-actions').style.display = 'flex';
}

function cancelEdit() {
    editMode = false;
    
    document.getElementById('cardContent').style.display = 'block';
    document.getElementById('cardContentEdit').style.display = 'none';
    
    document.getElementById('modifyBtn').style.display = 'inline-block';
    document.getElementById('aspectBtn').style.display = 'inline-block';
    document.getElementById('deleteBtn').style.display = 'inline-block';
    document.querySelector('.edit-actions').style.display = 'none';
}

async function saveEdit() {
    const newContent = document.getElementById('cardContentEdit').value.trim();
    
    if (!newContent) {
        alert('⚠️ Le contenu ne peut pas être vide.');
        return;
    }

    currentBookData.content = newContent;
    
    try {
        await saveBook(currentBookData);
        document.getElementById('cardContent').textContent = newContent;
        cancelEdit();
        await renderBooks();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('❌ Erreur lors de la sauvegarde.');
    }
}

// ========================================
// MODIFICATION DE L'ASPECT
// ========================================

function openAspectModal() {
    currentShelfLevel = currentBookData.level;
    
    document.getElementById('modalTitle').textContent = 'Modifier l\'aspect';
    document.getElementById('bookTitle').value = currentBookData.title;
    document.getElementById('bookContent').value = currentBookData.content;
    
    // Select current style and color
    document.querySelectorAll('.style-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.style === currentBookData.style);
    });
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.color === currentBookData.color);
    });

    closeCardModal();
    document.getElementById('bookModal').classList.add('active');
}

// ========================================
// SUPPRESSION
// ========================================

async function deleteCurrentBook() {
    if (!confirm(`🗑️ Êtes-vous sûr de vouloir supprimer "${currentBookData.title}" ?`)) {
        return;
    }

    try {
        await deleteBook(currentBookData.id);
        await renderBooks();
        closeCardModal();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('❌ Erreur lors de la suppression.');
    }
}

// ========================================
// EXPORT / IMPORT
// ========================================

async function exportData() {
    try {
        const books = await getAllBooks();
        const dataStr = JSON.stringify(books, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grimoire-litteraire-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        alert('❌ Erreur lors de l\'export.');
    }
}

async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const books = JSON.parse(e.target.result);
            
            if (!confirm(`📥 Importer ${books.length} livre(s) ? Cela écrasera les données existantes.`)) {
                return;
            }

            // Clear existing data
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            await new Promise((resolve, reject) => {
                const clearRequest = store.clear();
                clearRequest.onsuccess = resolve;
                clearRequest.onerror = reject;
            });

            // Import new data
            for (const book of books) {
                // On enlève l'id pour que la DB en assigne un nouveau
                const bookToImport = {
                    title: book.title,
                    content: book.content,
                    style: book.style,
                    color: book.color,
                    level: book.level
                };
                await saveBook(bookToImport);
            }

            await renderBooks();
            alert('✅ Import réussi !');
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            alert('❌ Erreur lors de l\'import. Vérifiez le format du fichier.');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// ========================================
// PARTICULES DORÉES
// ========================================

function initParticles() {
    const canvas = document.getElementById('particlesCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 40;

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedY = Math.random() * 0.5 + 0.2;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.life = Math.random() * 200 + 100;
            this.maxLife = this.life;
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.life--;

            if (this.life <= 0 || this.y < 0 || this.x < 0 || this.x > canvas.width) {
                this.reset();
                this.y = canvas.height;
            }
        }

        draw() {
            const fadeOpacity = this.opacity * (this.life / this.maxLife);
            ctx.fillStyle = `rgba(218, 165, 32, ${fadeOpacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(218, 165, 32, ${fadeOpacity * 0.8})`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        await renderBooks();
        initParticles();
    } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        alert('❌ Erreur lors de l\'initialisation de l\'application.');
    }

    // Add book buttons
    document.querySelectorAll('.add-book-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const level = this.closest('.shelf').dataset.level;
            openAddBookModal(level);
        });
    });

    // Book modal
    document.querySelector('#bookModal .close-btn').addEventListener('click', closeBookModal);
    document.getElementById('cancelBtn').addEventListener('click', closeBookModal);
    document.getElementById('saveBookBtn').addEventListener('click', saveBookFromModal);

    // Card modal
    document.querySelector('#cardModal .close-btn').addEventListener('click', closeCardModal);
    document.getElementById('modifyBtn').addEventListener('click', enterEditMode);
    document.getElementById('aspectBtn').addEventListener('click', openAspectModal);
    document.getElementById('deleteBtn').addEventListener('click', deleteCurrentBook);
    document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
    document.getElementById('saveEditBtn').addEventListener('click', saveEdit);

    // Style selection
    document.querySelectorAll('.style-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Color selection
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Export/Import
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                if (editMode) cancelEdit();
            }
        });
    });
});
