//Create Tables
'create table subjects ( id int auto_increment,name varchar(100),description varchar(500),primary key(id))',
'CREATE TABLE users_subject (id INT NOT NULL AUTO_INCREMENT,userId INT NOT NULL,subjectId INT NOT NULL,PRIMARY KEY (id),CONSTRAINT fk_user_subject FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,CONSTRAINT fk_subject_user FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE);subjects',
'CREATE TABLE users (id int NOT NULL AUTO_INCREMENT,name varchar(100) NOT NULL,email varchar(100) NOT NULL,password varchar(100) NOT NULL,biography text,country varchar(100) DEFAULT NULL,type varchar(50) NOT NULL,imgurl varchar(255) DEFAULT NULL,PRIMARY KEY (id)) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;',
		
//Create Mock Data