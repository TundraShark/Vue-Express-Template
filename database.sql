SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;

CREATE TABLE `sample` (
  `id` int(11) NOT NULL,
  `name` varchar(64) COLLATE utf16_bin NOT NULL,
  `age` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_bin;

INSERT INTO `sample` (`id`, `name`, `age`) VALUES
(1, 'Alex', 10),
(2, 'Bob', 15),
(3, 'Carl', 20);

ALTER TABLE `sample`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `sample`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;
