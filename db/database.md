[List of Tables]
CREATE TABLE class_faculty (
    class_id    INTEGER,
    faculty_id  INTEGER,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (
        class_id,
        faculty_id
    ),
    FOREIGN KEY (
        class_id
    )
    REFERENCES classes (id) ON DELETE CASCADE,
    FOREIGN KEY (
        faculty_id
    )
    REFERENCES users (id) 
);

CREATE TABLE class_students (
    class_id    INTEGER,
    student_id  INTEGER,
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (
        class_id,
        student_id
    ),
    FOREIGN KEY (
        class_id
    )
    REFERENCES classes (id) ON DELETE CASCADE,
    FOREIGN KEY (
        student_id
    )
    REFERENCES users (id) 
);

CREATE TABLE classes (
    id          INTEGER  PRIMARY KEY AUTOINCREMENT,
    class_code  TEXT     NOT NULL,
    class_name  TEXT     NOT NULL,
    description TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME
);

CREATE TABLE consultation_form (
    consultation_id    INTEGER   PRIMARY KEY
                                 NOT NULL,
    faculty_id         INTEGER,
    date               DATE,
    program            TEXT,
    venue              TEXT,
    start_time         TIMESTAMP,
    end_time           TIMESTAMP,
    course_code        TEXT,
    term               TEXT      CHECK (term IN ('Prelim', 'Midterm', 'Final') ) 
                                 NOT NULL,
    course_concerns    TEXT,
    intervention       TEXT,
    nature_of_concerns TEXT
);

CREATE TABLE consultation_requests (
    id             INTEGER  PRIMARY KEY AUTOINCREMENT,
    faculty_id     INTEGER  NOT NULL,
    course_code    TEXT     NOT NULL,
    date_requested DATE     NOT NULL,
    time_requested TIME     NOT NULL,
    reason         TEXT     NOT NULL,
    date_created   DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_closed    DATETIME,
    status         TEXT     CHECK (status IN ('pending', 'accepted', 'rejected') ) 
                            DEFAULT 'pending',
    FOREIGN KEY (
        faculty_id
    )
    REFERENCES faculty (user_id) ON DELETE CASCADE
);

CREATE TABLE consultation_requests_students (
    consultation_request_id INTEGER NOT NULL,
    student_id              INTEGER NOT NULL,
    PRIMARY KEY (
        consultation_request_id,
        student_id
    ),
    FOREIGN KEY (
        consultation_request_id
    )
    REFERENCES consultation_requests (id) ON DELETE CASCADE,
    FOREIGN KEY (
        student_id
    )
    REFERENCES students (user_id) ON DELETE CASCADE
);

CREATE TABLE consultation_students (
    consultation_id INTEGER NOT NULL,
    student_id      INTEGER NOT NULL,
    PRIMARY KEY (
        consultation_id,
        student_id
    ),
    FOREIGN KEY (
        consultation_id
    )
    REFERENCES consultation_form (consultation_id),
    FOREIGN KEY (
        student_id
    )
    REFERENCES students (user_id) 
);

CREATE TABLE consultation_summary (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    school             TEXT,
    year_level         TEXT,
    semester_ay        TEXT,
    college_term       TEXT    CHECK (college_term IN ('Prelim', 'Midterm', 'PreFinal') ),
    bed_shs_term       TEXT    CHECK (bed_shs_term IN ('1st_Qtr', '2nd_Qtr', '3rd_Qtr', '4th_Qtr') ),
    number_of_students INTEGER,
    total_hours        REAL,
    summary_report     TEXT,
    date_created       TEXT    DEFAULT (datetime('now') ) 
);

CREATE TABLE faculty (
    user_id        INTEGER PRIMARY KEY,
    department     TEXT,
    specialization TEXT,
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (id) 
);

CREATE TABLE faculty_availability (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id  INTEGER NOT NULL,
    course      TEXT,
    day_of_week TINYINT NOT NULL,
    start_time  TIME    NOT NULL,
    end_time    TIME    NOT NULL,
    FOREIGN KEY (
        faculty_id
    )
    REFERENCES faculty (id) 
);

CREATE TABLE faculty_availability (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id  INTEGER NOT NULL,
    course      TEXT,
    day_of_week TINYINT NOT NULL,
    start_time  TIME    NOT NULL,
    end_time    TIME    NOT NULL,
    FOREIGN KEY (
        faculty_id
    )
    REFERENCES faculty (id) 
);

CREATE TABLE faculty_unavailable_days (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id INTEGER NOT NULL,
    date       TEXT    NOT NULL,
    FOREIGN KEY (
        faculty_id
    )
    REFERENCES faculty (user_id) ON DELETE CASCADE
);

CREATE TABLE feedback (
    id         INTEGER PRIMARY KEY
                       NOT NULL,
    faculty_id INTEGER,
    student_id INTEGER,
    rating     INTEGER,
    comment    TEXT
);

CREATE TABLE history (
    id         INTEGER  PRIMARY KEY,
    date       DATETIME,
    faculty_id INTEGER,
    status     VARCHAR,
    notes      TEXT
);

CREATE TABLE inbox (
    id          INTEGER  PRIMARY KEY
                         NOT NULL,
    receiver_id INTEGER,
    sender_id   INTEGER,
    message     TEXT,
    sent_at     DATETIME
);

CREATE TABLE setting (
    id                  INTEGER PRIMARY KEY,
    email               VARCHAR,
    email_notification  BOOLEAN,
    appointment_updates BOOLEAN,
    feedback_responses  BOOLEAN
);

CREATE TABLE students (
    user_id    INTEGER PRIMARY KEY,
    program    TEXT,
    year_level INTEGER,
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (id) 
);

CREATE TABLE users (
    id       INTEGER PRIMARY KEY,
    name     TEXT,
    email    TEXT    UNIQUE,
    password TEXT,
    role     TEXT    CHECK (role IN ('student', 'faculty', 'admin') ) 
);
